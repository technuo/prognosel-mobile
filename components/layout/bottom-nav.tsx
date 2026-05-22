"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, MessageCircle, CheckSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

const tabs = [
  { key: "home", href: "/dashboard/", icon: Home },
  { key: "planner", href: "/dashboard/planner/", icon: Calendar },
  { key: "sparky", href: "/dashboard/sparky/", icon: MessageCircle },
  { key: "tasks", href: "/dashboard/tasks/", icon: CheckSquare },
  { key: "profile", href: "/dashboard/settings/", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabLabels: Record<string, string> = {
    home: t.home,
    planner: t.planner,
    sparky: t.sparky,
    tasks: t.todo,
    profile: t.profile,
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[84px] bg-white/90 backdrop-blur-xl border-t border-black/[0.06] z-50">
      <div className="flex justify-around items-start pt-2 h-full pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-2 py-1 min-w-[52px]"
            >
              <Icon
                size={24}
                strokeWidth={2}
                className={cn(
                  "transition-colors",
                  isActive ? "text-accent" : "text-faint"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-tight",
                  isActive ? "text-accent" : "text-faint"
                )}
              >
                {tabLabels[tab.key]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
