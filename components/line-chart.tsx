"use client";

import { MONTHS } from "@/lib/data";

interface LineChartProps {
  maxCAC: number[];
  realCAC: (number | null)[];
  ceiling: number;
}

function fmtK(v: number): string {
  return v >= 1000
    ? `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`
    : `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

const W = 720;
const H = 200;
const PAD = { top: 28, right: 16, bottom: 28, left: 56 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

export function LineChart({ maxCAC, realCAC, ceiling }: LineChartProps) {
  const ceil = Math.max(ceiling, 1);

  function x(i: number) {
    return PAD.left + (i / 11) * PLOT_W;
  }
  function y(v: number) {
    return PAD.top + PLOT_H - (v / ceil) * PLOT_H;
  }

  const maxPoints = maxCAC
    .map((v, i) => (v > 0 ? `${x(i)},${y(v)}` : null))
    .filter(Boolean)
    .join(" ");

  const realPoints: string[] = [];
  const realDots: { cx: number; cy: number; val: number; over: boolean; idx: number }[] = [];
  realCAC.forEach((v, i) => {
    if (v != null) {
      realPoints.push(`${x(i)},${y(v)}`);
      realDots.push({ cx: x(i), cy: y(v), val: v, over: v > maxCAC[i] && maxCAC[i] > 0, idx: i });
    }
  });

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((ceil / gridLines) * i)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 500 }}
      >
        {/* Grid lines + Y labels */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={y(v)}
              x2={W - PAD.right}
              y2={y(v)}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={1}
              strokeDasharray={v === 0 ? "none" : "3 3"}
            />
            <text
              x={PAD.left - 8}
              y={y(v) + 3}
              textAnchor="end"
              className="fill-zinc-400 dark:fill-zinc-600"
              fontSize={9}
              fontWeight={600}
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {fmtK(v)}
            </text>
          </g>
        ))}

        {/* X labels (months) */}
        {MONTHS.map((m, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor="middle"
            className="fill-zinc-400 dark:fill-zinc-500"
            fontSize={10}
            fontWeight={600}
          >
            {m}
          </text>
        ))}

        {/* Max CAC line (teto) */}
        {maxPoints && (
          <polyline
            points={maxPoints}
            fill="none"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinecap="round"
            opacity={0.7}
          />
        )}

        {/* Max CAC dots */}
        {maxCAC.map((v, i) =>
          v > 0 ? (
            <circle
              key={`max-${i}`}
              cx={x(i)}
              cy={y(v)}
              r={3}
              fill="#ef4444"
              opacity={0.5}
            />
          ) : null
        )}

        {/* Real CAC line */}
        {realPoints.length > 1 && (
          <polyline
            points={realPoints.join(" ")}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Real CAC dots + value labels */}
        {realDots.map((dot) => (
          <g key={`real-${dot.idx}`}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={4.5}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1.5}
              className="dark:stroke-zinc-900"
            />
            <text
              x={dot.cx}
              y={dot.cy - 10}
              textAnchor="middle"
              fill={dot.over ? "#ef4444" : "#3b82f6"}
              fontSize={9}
              fontWeight={700}
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {fmtK(dot.val)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
