"use client";

import { useId } from "react";

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  color: string;
  size?: "lg" | "sm";
}

function pt(deg: number, r: number, cx: number, cy: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function arc(
  from: number,
  to: number,
  r: number,
  cx: number,
  cy: number
): string {
  const s = pt(from, r, cx, cy);
  const e = pt(to, r, cx, cy);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const START = -135;
const SWEEP = 270;

export function GaugeChart({
  value,
  max,
  label,
  sublabel,
  color,
  size = "lg",
}: GaugeProps) {
  const uid = useId();
  const pct = max > 0 ? value / max : 0;
  const clamped = Math.min(Math.max(pct, 0), 1);
  const displayPct = Math.round(pct * 100);

  const W = 200;
  const cx = W / 2;
  const cy = W / 2;
  const sw = size === "lg" ? 20 : 14;
  const r = (W - sw) / 2 - 6;

  const bgPath = arc(START, START + SWEEP, r, cx, cy);
  const fillAngle = SWEEP * clamped;
  const fillPath =
    fillAngle > 0.5 ? arc(START, START + fillAngle, r, cx, cy) : "";

  const textY = cy + (size === "lg" ? 4 : 2);
  const subY = textY + (size === "lg" ? 24 : 17);
  const pctFS = size === "lg" ? 44 : 28;
  const subFS = size === "lg" ? 12 : 9.5;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 16 ${W} ${W * 0.65}`}
        className={
          size === "lg" ? "w-full max-w-[280px]" : "w-full max-w-[150px]"
        }
      >
        <defs>
          <filter id={`gl${uid}`}>
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={sw}
          strokeLinecap="round"
        />

        {/* filled arc */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            filter={`url(#gl${uid})`}
          />
        )}

        {/* percentage */}
        <text
          x={cx}
          y={textY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={pctFS}
          fontWeight={800}
          fill="white"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          {displayPct}%
        </text>

        {/* sublabel */}
        {sublabel && (
          <text
            x={cx}
            y={subY}
            textAnchor="middle"
            fontSize={subFS}
            fontWeight={600}
            fill="#555"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            {sublabel}
          </text>
        )}
      </svg>
      <div
        className={[
          "text-center font-bold text-zinc-400",
          size === "lg" ? "-mt-1 text-[15px]" : "-mt-1 text-[12px]",
        ].join(" ")}
      >
        {label}
      </div>
    </div>
  );
}
