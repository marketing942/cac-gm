"use client";

import { MONTHS } from "@/lib/data";

interface EfficiencyGridProps {
  realCAC: (number | null)[];
  maxCAC: number[];
}

export function EfficiencyGrid({ realCAC, maxCAC }: EfficiencyGridProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MONTHS.map((m, i) => {
        const r = realCAC[i];
        const over = r != null && r > maxCAC[i];
        const ok = r != null && !over;

        const textColor = ok
          ? "text-lime-600 dark:text-lime-400"
          : over
          ? "text-red-600 dark:text-red-400"
          : "text-fg-muted";

        return (
          <div
            key={i}
            className={[
              "flex h-[50px] w-[50px] flex-col items-center justify-center rounded-lg border transition-all duration-300",
              ok
                ? "border-lime-500/30 bg-lime-500/10"
                : over
                ? "border-red-500/30 bg-red-500/10"
                : "border-zinc-850 bg-surface-2",
            ].join(" ")}
          >
            <span className={["text-[10px] font-bold", textColor].join(" ")}>
              {m}
            </span>
            <span className={["mt-0.5 text-sm", textColor].join(" ")}>
              {ok ? "✓" : over ? "✗" : "·"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
