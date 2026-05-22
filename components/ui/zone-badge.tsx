import { zoneList } from "@/lib/i18n/translations";
import type { ZoneCode } from "@/types";

interface ZoneBadgeProps {
  code: ZoneCode;
  size?: "small" | "medium";
}

export function ZoneBadge({ code, size = "small" }: ZoneBadgeProps) {
  const z = zoneList.find((x) => x.code === code) || zoneList[2];

  const sizeClasses =
    size === "small"
      ? "px-2 py-0.5 text-[11px]"
      : "px-3 py-1 text-[13px]";

  return (
    <span
      className="inline-block rounded-full font-mono font-semibold tracking-wide"
      style={{
        padding: size === "small" ? "2px 8px" : "4px 12px",
        fontSize: size === "small" ? 11 : 13,
        background: z.bg,
        color: z.text,
      }}
    >
      {code}
    </span>
  );
}
