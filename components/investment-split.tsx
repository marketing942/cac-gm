"use client";

import { fmt } from "@/lib/data";

interface InvestmentSplitProps {
  totalMkt: number;
  totalCom: number;
  totalInv: number;
  accent: string;
}

export function InvestmentSplit({ totalMkt, totalCom, totalInv, accent }: InvestmentSplitProps) {
  if (totalInv <= 0) {
    return <div className="text-xs text-zinc-700">Sem dados</div>;
  }

  const mktPct = ((totalMkt / totalInv) * 100).toFixed(0);
  const comPct = ((totalCom / totalInv) * 100).toFixed(0);

  return (
    <>
      <div className="mb-3.5 flex h-2 overflow-hidden rounded">
        <div
          className="transition-all duration-500"
          style={{ width: `${mktPct}%`, background: accent }}
        />
        <div className="flex-1 bg-amber-400" />
      </div>
      <div className="flex justify-between text-xs">
        <div>
          <span className="font-bold" style={{ color: accent }}>● Marketing</span>
          <span className="ml-2 text-zinc-500">{fmt(totalMkt)}</span>
          <span className="ml-1.5 text-zinc-600">({mktPct}%)</span>
        </div>
        <div>
          <span className="font-bold text-amber-400">● Comercial</span>
          <span className="ml-2 text-zinc-500">{fmt(totalCom)}</span>
          <span className="ml-1.5 text-zinc-600">({comPct}%)</span>
        </div>
      </div>
    </>
  );
}
