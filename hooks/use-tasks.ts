"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { computeStreakFromDates, stockholmDateKey } from "@/lib/streak";
import type { ZoneCode, Task } from "@/types";

const STORAGE_KEY = "prognosel-tasks";
const SYNC_KEY = "prognosel-task-sync";
const STREAK_KEY = "prognosel-streak";

/**
 * Offline-first task store.
 *
 * Mutations are applied to local state immediately AND recorded in a durable
 * queue, so a failed or slow Supabase write can never make the UI "forget"
 * what the user did. The queue is flushed on load and after each mutation;
 * an op is removed only once the server confirmed it.
 *
 * The streak is derived from `tasks.completed_at` (server data) instead of a
 * localStorage counter, so it survives a device change and cannot drift from
 * the tasks themselves.
 */
type SyncOp =
  | { op: "insert"; task: Task; zone: ZoneCode }
  | { op: "update"; id: string; done: boolean }
  | { op: "delete"; id: string };

interface ServerTaskRow {
  id: string;
  title: string;
  status: string;
  estimated_savings: number;
  description: string | null;
  scheduled_at: string | null;
  completed_at?: string | null;
}

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

function clearLocalTasks() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
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

function dbToTask(row: ServerTaskRow): Task {
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
 * Load tasks for a zone. Retries without `completed_at` when the live schema
 * lacks that column, so a missing column can never hide the user's tasks.
 */
async function fetchServerTasks(uid: string, zone: ZoneCode): Promise<ServerTaskRow[]> {
  const withStamp = await supabase
    .from("tasks")
    .select("id, title, status, estimated_savings, description, scheduled_at, completed_at")
    .eq("user_id", uid)
    .eq("zone", zone)
    .order("created_at", { ascending: false });

  if (!withStamp.error) return (withStamp.data ?? []) as ServerTaskRow[];

  const withoutStamp = await supabase
    .from("tasks")
    .select("id, title, status, estimated_savings, description, scheduled_at")
    .eq("user_id", uid)
    .eq("zone", zone)
    .order("created_at", { ascending: false });

  if (withoutStamp.error) {
    console.error("[tasks] load failed:", withoutStamp.error.message);
    return [];
  }
  return (withoutStamp.data ?? []) as ServerTaskRow[];
}

/** Push queued ops to Supabase. Returns true when the queue is empty again. */
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
        // Only columns that certainly exist; completed_at is best-effort.
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
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [localStreak, setLocalStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState(false);
  const flushInFlight = useRef(false);

  const streak = userId ? computeStreakFromDates(completedDates) : localStreak;

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
      let dates: string[] = [];

      if (uid) {
        const rows = await fetchServerTasks(uid, zone);
        serverTasks = rows.map(dbToTask);
        dates = rows
          .filter((r) => r.status === "completed" && r.completed_at)
          .map((r) => stockholmDateKey(r.completed_at as string));

        // One-time migration: tasks created before signing in existed only in
        // localStorage. Import them into the account, then clear the local copy.
        const locals = loadLocalTasks();
        if (locals.length > 0) {
          const known = new Set(serverTasks.map((t) => t.id));
          const extras = locals.filter((t) => !known.has(t.id));
          if (extras.length > 0) {
            writeQueue([
              ...readQueue(),
              ...extras.map((task) => ({ op: "insert", task, zone }) as SyncOp),
            ]);
            serverTasks = [...extras, ...serverTasks];
          }
          clearLocalTasks();
        }
      } else {
        serverTasks = loadLocalTasks();
      }

      // Overlay anything the user did that the server has not confirmed yet.
      const merged = uid ? applyQueue(serverTasks, readQueue()) : serverTasks;

      if (!cancelled) {
        setTasks(merged);
        setCompletedDates(dates);
        setLocalStreak(loadLocalStreak());
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
        writeQueue([...readQueue(), { op: "update", id, done: newDone }]);
        saveLocalTasks(updated);
        if (newDone) {
          const today = stockholmDateKey();
          setCompletedDates((prev) => (prev.includes(today) ? prev : [today, ...prev]));
        }
        await syncNow(userId);
      } else {
        saveLocalTasks(updated);
        if (newDone) {
          const next = computeStreakFromDates([...completedDates, stockholmDateKey()]);
          setLocalStreak(next);
          if (typeof window !== "undefined") {
            localStorage.setItem(STREAK_KEY, String(next));
          }
        }
      }
    },
    [tasks, userId, completedDates, syncNow]
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
