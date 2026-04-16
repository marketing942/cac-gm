"use client";

import { MONTHS } from "@/lib/data";

interface BarChartProps {
  maxCAC: number[];
  realCAC: (number | null)[];
  ceiling: number;
}

function fmtK(v: number): string {
  return v >= 1000
    ? `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`
    : `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

export function BarChart({ maxCAC, realCAC, ceiling }: BarChartProps) {
  const h = 160;

  return (
    <div className="flex items-end gap-1">
      {MONTHS.map((m, i) => {
        const mH = Math.min((maxCAC[i] / ceiling) * h, h);
        const rVal = realCAC[i];
        const rH = rVal != null ? Math.min((rVal / ceiling) * h, h) : 0;
        const over = rVal != null && rVal > maxCAC[i];

        return (
          <div
            key={i}
            className="flex min-w-[42px] flex-1 flex-col items-center animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Value label */}
            <div
              className={[
                "mb-1 h-3.5 text-[10px] font-bold",
                over
                  ? "text-red-600 dark:text-red-400"
                  : rVal
                  ? "text-lime-600 dark:text-lime-400"
                  : "text-fg-muted",
              ].join(" ")}
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {rVal != null ? fmtK(rVal) : ""}
            </div>

            {/* Bars container */}
            <div
              className="relative flex w-full items-end justify-center gap-[3px]"
              style={{ height: h }}
            >
              {/* Max bar */}
              <div
                className="w-[40%] rounded-t border border-zinc-850 bg-surface-2 transition-all duration-500"
                style={{ height: mH }}
              />
              {/* Real bar */}
              <div
                className="w-[40%] rounded-t bg-surface-2 transition-all duration-500"
                style={{
                  height: rH || 2,
                  background: over
                    ? "linear-gradient(180deg, #f87171 0%, #b91c1c 100%)"
                    : rVal
                    ? "linear-gradient(180deg, #a3e635 0%, #65a30d 100%)"
                    : undefined,
                  boxShadow:
                    rVal && !over
                      ? "0 0 12px rgba(163,230,53,0.15)"
                      : over
                      ? "0 0 12px rgba(248,113,113,0.2)"
                      : "none",
                }}
              />
            </div>

            {/* Month label */}
            <div className="mt-1.5 text-[11px] font-semibold text-zinc-500">
              {m}
            </div>
          </div>
        );
      })}
    </div>
  );
}
