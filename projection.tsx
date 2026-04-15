"use client";

import { fmt, fmtK, type CACComputed } from "@/lib/data";

interface ProjectionProps {
  comp: CACComputed;
  accent: string;
}

export function Projection({ comp, accent }: ProjectionProps) {
  if (comp.activeMonths < 2) return null;

  const items = [
    {
      label: "Clientes projetados",
      value: Math.round((comp.totalCli / comp.activeMonths) * 12).toLocaleString("pt-BR"),
      color: "#fbbf24",
    },
    {
      label: "Investimento projetado",
      value: fmtK(Math.round((comp.totalInv / comp.activeMonths) * 12)),
      color: accent,
    },
    {
      label: "CAC projetado",
      value: comp.avgCAC ? fmt(comp.avgCAC) : "—",
      color: comp.avgCAC && comp.avgCAC <= comp.avgMax ? "#a3e635" : "#f87171",
    },
    {
      label: "Economia vs teto",
      value: comp.avgCAC ? fmt(comp.avgMax - comp.avgCAC) : "—",
      color: comp.avgCAC && comp.avgCAC <= comp.avgMax ? "#a3e635" : "#f87171",
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
      <div className="mb-3.5 text-[13px] font-bold text-zinc-500">
        Projeção 12 Meses (com base no ritmo atual)
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((p, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-surface-2 px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-zinc-600">
              {p.label}
            </div>
            <div
              className="mt-1 text-[22px] font-black tracking-tight"
              style={{ color: p.color, fontFeatureSettings: "'tnum'" }}
            >
              {p.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
