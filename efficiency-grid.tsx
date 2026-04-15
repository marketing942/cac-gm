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

        return (
          <div
            key={i}
            className="flex h-[50px] w-[50px] flex-col items-center justify-center rounded-lg border transition-all duration-300"
            style={{
              background: ok
                ? "rgba(163,230,53,0.08)"
                : over
                ? "rgba(248,113,113,0.08)"
                : "#18181b",
              borderColor: ok
                ? "rgba(163,230,53,0.15)"
                : over
                ? "rgba(248,113,113,0.15)"
                : "#27272a",
            }}
          >
            <span
              className="text-[10px] font-bold"
              style={{
                color: ok ? "#a3e635" : over ? "#f87171" : "#3f3f46",
              }}
            >
              {m}
            </span>
            <span className="mt-0.5 text-sm">
              {ok ? "✓" : over ? "✗" : "·"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
