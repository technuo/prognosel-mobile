"use client";

import { ZoneBadge } from "@/components/ui/zone-badge";
import type { ZoneCode } from "@/types";

interface NavHeaderProps {
  title: string;
  zone?: ZoneCode;
}

export default function NavHeader({ title, zone }: NavHeaderProps) {
  return (
    <div className="px-5 pt-2 bg-paper">
      <div className="flex items-center justify-between h-9">
        <div className="w-[60px]" />
        <div className="flex items-center gap-1.5">
          {zone && <ZoneBadge code={zone} />}
        </div>
        <div className="w-[60px]" />
      </div>
      <h1 className="font-serif text-[28px] font-bold text-ink tracking-tight leading-tight mt-1">
        {title}
      </h1>
    </div>
  );
}
