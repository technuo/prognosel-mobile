"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ZoneCode, Task } from "@/types";

const STORAGE_KEY = "prognosel-tasks";
const STREAK_KEY = "prognosel-streak";
const STREAK_DATE_KEY = "prognosel-streak-date";

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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

export function useTasks(zone: ZoneCode) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user + tasks on mount / zone change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoaded(false);

      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      let loadedTasks: Task[] = [];

      if (uid) {
        // Authenticated: load from Supabase
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, status, estimated_savings, description, scheduled_at")
          .eq("user_id", uid)
          .eq("zone", zone)
          .order("created_at", { ascending: false });

        if (!cancelled) {
          if (data && !error) {
            loadedTasks = data.map(dbToTask);
          } else {
            // Fallback to localStorage on error
            loadedTasks = loadLocalTasks().filter((t) => !t.scheduled_at || t.scheduled_at.startsWith(zone));
          }
        }
      } else {
        // Not authenticated: localStorage
        loadedTasks = loadLocalTasks();
      }

      if (!cancelled) {
        setTasks(loadedTasks);
        setStreak(loadLocalStreak());
        setLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone]);

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

      if (userId) {
        const { error } = await supabase.from("tasks").insert({
          id: newTask.id,
          user_id: userId,
          title: newTask.title,
          status: "pending",
          estimated_savings: newTask.savings,
          zone,
          source: "mobile",
        });
        if (error) {
          console.error("Failed to insert task:", error);
          // Still add to local state + localStorage as fallback
          const updated = [newTask, ...tasks];
          setTasks(updated);
          saveLocalTasks(updated);
          return;
        }
      }

      const updated = [newTask, ...tasks];
      setTasks(updated);
      if (!userId) saveLocalTasks(updated);
    },
    [tasks, userId, zone]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newDone = !task.done;
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, done: newDone } : t
      );
      setTasks(updated);

      if (userId) {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: newDone ? "completed" : "pending",
            completed_at: newDone ? new Date().toISOString() : null,
          })
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to update task:", error);
        }
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
    [tasks, userId, streak]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);

      if (userId) {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Failed to delete task:", error);
        }
      } else {
        saveLocalTasks(updated);
      }
    },
    [tasks, userId]
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
  };
}
