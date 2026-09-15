"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ZoneCode, Task } from "@/types";

const STORAGE_KEY = "prognosel-tasks";
const SYNC_KEY = "prognosel-task-sync";
const STREAK_KEY = "prognosel-streak";
const STREAK_DATE_KEY = "prognosel-streak-date";

/**
 * Offline-first sync queue.
 *
 * Every mutation is applied to local state immediately AND recorded here, so a
 * failed (or slow) Supabase write can never make the UI "forget" what the user
 * did. The queue is flushed to Supabase on load and after each mutation; ops
 * are only removed once the server confirmed them.
 */
type SyncOp =
  | { op: "insert"; task: Task; zone: ZoneCode }
  | { op: "update"; id: string; done: boolean }
  | { op: "delete"; id: string };

function loadLocalTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage full / private mode — ignore */
  }
}

function readQueue(): SyncOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? (JSON.parse(raw) as SyncOp[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(ops: SyncOp[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(ops));
  } catch {
    /* ignore */
  }
}

function loadLocalStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveLocalStreak(streak: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, String(streak));
}

function dbToTask(row: {
  id: string;
  title: string;
  status: string;
  estimated_savings: number;
  description: string | null;
  scheduled_at: string | null;
}): Task {
  return {
    id: row.id,
    title: row.title,
    done: row.status === "completed",
    savings: row.estimated_savings || 0,
    kwh: 0,
    description: row.description || undefined,
    scheduled_at: row.scheduled_at || undefined,
  };
}

/** Apply queued (not yet server-confirmed) ops on top of server data. */
function applyQueue(tasks: Task[], ops: SyncOp[]): Task[] {
  let result = [...tasks];
  for (const op of ops) {
    if (op.op === "insert") {
      if (!result.some((t) => t.id === op.task.id)) result = [op.task, ...result];
    } else if (op.op === "update") {
      result = result.map((t) => (t.id === op.id ? { ...t, done: op.done } : t));
    } else {
      result = result.filter((t) => t.id !== op.id);
    }
  }
  return result;
}

/**
 * Push queued ops to Supabase. Returns true when the queue is empty again.
 * Successful ops are removed; failures stay queued for the next attempt.
 */
async function flushQueue(userId: string): Promise<boolean> {
  const queue = readQueue();
  if (queue.length === 0) return true;

  const remaining: SyncOp[] = [];

  for (const op of queue) {
    try {
      if (op.op === "insert") {
        const { error } = await supabase.from("tasks").insert({
          id: op.task.id,
          user_id: userId,
          title: op.task.title,
          status: op.task.done ? "completed" : "pending",
          estimated_savings: op.task.savings,
          zone: op.zone,
          source: "mobile",
        });
        // 23505 = duplicate key → the row already exists, treat as synced.
        if (error && error.code !== "23505") {
          console.error("[tasks] insert failed:", error.message);
          remaining.push(op);
        }
      } else if (op.op === "update") {
        // Only send the columns that certainly exist; completed_at is a
        // best-effort extra so a schema mismatch can't block the status change.
        const { error } = await supabase
          .from("tasks")
          .update({ status: op.done ? "completed" : "pending" })
          .eq("id", op.id)
          .eq("user_id", userId);

        if (error) {
          console.error("[tasks] update failed:", error.message);
          remaining.push(op);
        } else {
          const { error: stampError } = await supabase
            .from("tasks")
            .update({ completed_at: op.done ? new Date().toISOString() : null })
            .eq("id", op.id)
            .eq("user_id", userId);
          if (stampError) {
            // Non-fatal: the status change already persisted.
            console.warn("[tasks] completed_at not stored:", stampError.message);
          }
        }
      } else {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", op.id)
          .eq("user_id", userId);
        if (error) {
          console.error("[tasks] delete failed:", error.message);
          remaining.push(op);
        }
      }
    } catch (error) {
      console.error("[tasks] sync error:", error);
      remaining.push(op);
    }
  }

  writeQueue(remaining);
  return remaining.length === 0;
}

export function useTasks(zone: ZoneCode) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState(false);
  const flushInFlight = useRef(false);

  const syncNow = useCallback(async (uid: string) => {
    if (flushInFlight.current) return;
    flushInFlight.current = true;
    try {
      const clean = await flushQueue(uid);
      setSyncError(!clean);
    } finally {
      flushInFlight.current = false;
    }
  }, []);

  // Load user + tasks on mount / zone change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoaded(false);

      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      let serverTasks: Task[] = [];

      if (uid) {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, status, estimated_savings, description, scheduled_at")
          .eq("user_id", uid)
          .eq("zone", zone)
          .order("created_at", { ascending: false });

        if (data && !error) {
          serverTasks = data.map(dbToTask);
        } else {
          if (error) console.error("[tasks] load failed:", error.message);
          serverTasks = loadLocalTasks().filter(
            (t) => !t.scheduled_at || t.scheduled_at.startsWith(zone)
          );
        }
      } else {
        serverTasks = loadLocalTasks();
      }

      // Overlay anything the user did that the server has not confirmed yet,
      // so a page switch can never silently undo a completion.
      const merged = uid ? applyQueue(serverTasks, readQueue()) : serverTasks;

      if (!cancelled) {
        setTasks(merged);
        setStreak(loadLocalStreak());
        setLoaded(true);
      }

      if (uid && !cancelled) {
        void syncNow(uid);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone, syncNow]);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalSavings = tasks
    .filter((t) => t.done)
    .reduce((sum, t) => sum + t.savings, 0);
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;

  const addTask = useCallback(
    async (title: string, savings: number) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        done: false,
        savings,
        kwh: 0,
      };

      const updated = [newTask, ...tasks];
      setTasks(updated);

      if (userId) {
        writeQueue([...readQueue(), { op: "insert", task: newTask, zone }]);
        await syncNow(userId);
      } else {
        saveLocalTasks(updated);
      }
    },
    [tasks, userId, zone, syncNow]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newDone = !task.done;
      const updated = tasks.map((t) => (t.id === id ? { ...t, done: newDone } : t));
      setTasks(updated);

      if (userId) {
        // Record the intent first, then try to push it to the server.
        writeQueue([...readQueue(), { op: "update", id, done: newDone }]);
        saveLocalTasks(updated);
        await syncNow(userId);
      } else {
        saveLocalTasks(updated);
      }

      // Update streak when completing a task (once per day)
      if (newDone) {
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = typeof window !== "undefined"
          ? localStorage.getItem(STREAK_DATE_KEY)
          : null;

        let newStreak = streak;
        if (lastDate === today) {
          // Already completed a task today — streak unchanged
        } else if (lastDate) {
          const last = new Date(lastDate);
          const now = new Date(today);
          const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            newStreak = streak + 1;
          } else {
            newStreak = 1; // Reset after missing a day
          }
        } else {
          newStreak = 1; // First completion ever
        }

        setStreak(newStreak);
        saveLocalStreak(newStreak);
        if (typeof window !== "undefined") {
          localStorage.setItem(STREAK_DATE_KEY, today);
        }
      }
    },
    [tasks, userId, streak, syncNow]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);

      if (userId) {
        writeQueue([...readQueue(), { op: "delete", id }]);
        saveLocalTasks(updated);
        await syncNow(userId);
      } else {
        saveLocalTasks(updated);
      }
    },
    [tasks, userId, syncNow]
  );

  return {
    tasks,
    loaded,
    addTask,
    toggleTask,
    deleteTask,
    completedCount,
    totalSavings,
    progress,
    streak,
    syncError,
  };
}
