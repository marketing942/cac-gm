"use client";

import type { Product } from "@/lib/data";

interface HeaderProps {
  product: Product;
  onProductChange: (p: Product) => void;
}

export function Header({ product, onProductChange }: HeaderProps) {
  const accent = product === "cppem" ? "#3b82f6" : "#a78bfa";

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-gradient-to-b from-white/[0.015] to-transparent px-7 py-5">
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg text-[13px] font-black text-white"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
          }}
        >
          CAC
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-tight">
            Controle de CAC
          </div>
          <div className="text-[11px] font-medium text-zinc-600">
            GM Educação · 2026
          </div>
        </div>
      </div>

      <div className="flex rounded-lg border border-zinc-800 bg-surface-2 p-[3px]">
        {(["cppem", "unicv"] as const).map((p) => (
          <button
            key={p}
            onClick={() => onProductChange(p)}
            className="rounded-md border-none px-5 py-[7px] text-[13px] font-bold tracking-wide transition-all duration-200"
            style={{
              background:
                product === p
                  ? p === "cppem"
                    ? "#3b82f6"
                    : "#a78bfa"
                  : "transparent",
              color: product === p ? "#fff" : "#71717a",
              cursor: "pointer",
            }}
          >
            {p === "cppem" ? "CPPEM" : "UNICV"}
          </button>
        ))}
      </div>
    </header>
  );
}
