"use client";

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  delay?: number;
}

export function KpiCard({ label, value, sub, color, delay = 0 }: KpiCardProps) {
  return (
    <div
      className="rounded-[10px] border border-zinc-850 bg-surface-1 px-5 py-[18px] animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-zinc-600">
        {label}
      </div>
      <div
        className="mt-1.5 text-[26px] font-black tracking-tight"
        style={{ color, fontFeatureSettings: "'tnum'" }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-zinc-600">{sub}</div>
    </div>
  );
}
