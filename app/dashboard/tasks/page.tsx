"use client";

import { useState } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { useTasks } from "@/hooks/use-tasks";
import { Flame, Zap, Plus, Trash2 } from "lucide-react";

export default function TasksPage() {
  const { t } = useLanguage();
  const { zone } = useZone();
  const {
    tasks,
    loaded,
    addTask,
    toggleTask,
    deleteTask,
    completedCount,
    totalSavings,
    progress,
    streak,
  } = useTasks(zone);

  const [newTitle, setNewTitle] = useState("");
  const [newSavings, setNewSavings] = useState("");

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const savings = parseFloat(newSavings) || 0;
    addTask(title, savings);
    setNewTitle("");
    setNewSavings("");
  };

  if (!loaded) {
    return (
      <div className="animate-fade-in">
        <NavHeader title={t.todo} zone={zone} />
        <div className="px-5 pt-2 pb-24">
          <div className="h-[200px] flex items-center justify-center text-faint text-sm">
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <NavHeader title={t.todo} zone={zone} />

      <div className="px-5 pt-2 pb-24">
        {/* Day Streak Card */}
        <div
          className="rounded-[20px] p-5 mb-4 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #CC785C 0%, #E4927A 100%)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-white/80" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/80">
                Day Streak
              </span>
            </div>
            <div className="font-serif text-4xl font-bold leading-none">
              {streak}
            </div>
            <div className="text-sm text-white/80 mt-1">days</div>
            <div className="mt-3 text-xs text-white/70">
              {completedCount} of {tasks.length} tasks done · Saved{" "}
              {totalSavings.toFixed(0)} SEK
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <Zap size={80} />
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-card rounded-[20px] p-5 mb-5 shadow-sm border border-line">
          <div className="flex justify-between items-center mb-3">
            <span className="font-serif text-lg font-semibold text-ink">
              Today&apos;s Progress
            </span>
            <span className="text-sm font-mono text-muted">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-paper-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-card rounded-[20px] p-4 mb-5 shadow-sm border border-line">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
            <input
              type="number"
              value={newSavings}
              onChange={(e) => setNewSavings(e.target.value)}
              placeholder="SEK"
              className="w-16 bg-paper-2 rounded-lg px-2 py-1.5 text-sm text-ink outline-none placeholder:text-faint text-right"
            />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white disabled:opacity-40 transition-opacity cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-[10px] text-faint">
            Tip: enter estimated savings in SEK (optional)
          </p>
        </div>

        {/* My Tasks */}
        <h2 className="font-serif text-xl font-semibold text-ink mb-3">
          {t.myTasks}
        </h2>

        {tasks.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center text-faint text-sm">
            No tasks yet. Add one above!
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group w-full text-left p-4 rounded-2xl border transition-all bg-card border-line shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors cursor-pointer ${
                      task.done
                        ? "bg-good/20"
                        : "bg-paper-2 border border-line hover:border-line-hi"
                    }`}
                  >
                    {task.done && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7l3 3 5-6"
                          stroke="#5C8A5E"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleTask(task.id)}
                  >
                    <p
                      className={`text-sm font-medium ${
                        task.done ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-faint mt-0.5">
                      {task.done
                        ? `Saved ${task.savings.toFixed(0)} SEK`
                        : `Save ~${task.savings.toFixed(0)} SEK`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1.5 rounded-lg text-faint hover:text-bad hover:bg-bad/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
