"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-paper px-6">
      <div className="w-14 h-14 rounded-2xl bg-bad/10 flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-bad" />
      </div>
      <h1 className="font-serif text-xl font-semibold text-ink mb-2 text-center">
        Something went wrong
      </h1>
      <p className="text-sm text-muted text-center mb-6 max-w-[260px]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white text-sm font-semibold cursor-pointer border-none hover:bg-accent-hi transition-colors"
      >
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
