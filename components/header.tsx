"use client";

import { PRODUCTS, PRODUCT_META, type Product } from "@/lib/data";

interface HeaderProps {
  product: Product;
  year: number;
  years: number[];
  onProductChange: (p: Product) => void;
  onYearChange: (y: number) => void;
  onAddYear: () => void;
  onRemoveYear: (y: number) => void;
}

export function Header({
  product,
  year,
  years,
  onProductChange,
  onYearChange,
  onAddYear,
  onRemoveYear,
}: HeaderProps) {
  const meta = PRODUCT_META[product];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-gradient-to-b from-white/[0.015] to-transparent px-7 py-5">
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-lg border border-zinc-800 shadow-lg"
          style={{ background: meta.badgeBg }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.logo}
            alt={meta.label}
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-tight">
            {meta.label}
          </div>
          <div className="text-[11px] font-medium text-zinc-600">
            Controle de CAC · {year}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Year selector */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-surface-2 p-[3px]">
          {years.map((y) => (
            <div key={y} className="group relative">
              <button
                onClick={() => onYearChange(y)}
                className="rounded-md border-none px-3 py-[7px] text-[12px] font-bold transition-all duration-200"
                style={{
                  background: year === y ? meta.accent : "transparent",
                  color: year === y ? "#0a0a0a" : "#71717a",
                  cursor: "pointer",
                }}
              >
                {y}
              </button>
              {years.length > 1 && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remover dados do ano ${y}? Esta ação não pode ser desfeita.`
                      )
                    ) {
                      onRemoveYear(y);
                    }
                  }}
                  title={`Remover ${y}`}
                  className="absolute -right-1 -top-1 hidden h-[14px] w-[14px] items-center justify-center rounded-full bg-zinc-800 text-[9px] font-black text-zinc-400 hover:bg-red-500 hover:text-white group-hover:flex"
                  style={{ cursor: "pointer" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddYear}
            title="Adicionar próximo ano"
            className="rounded-md border-none px-2.5 py-[7px] text-[14px] font-black text-zinc-500 transition-colors hover:text-zinc-200"
            style={{ cursor: "pointer" }}
          >
            +
          </button>
        </div>

        {/* Product selector */}
        <div className="flex rounded-lg border border-zinc-800 bg-surface-2 p-[3px]">
          {PRODUCTS.map((p) => {
            const m = PRODUCT_META[p];
            const active = product === p;
            return (
              <button
                key={p}
                onClick={() => onProductChange(p)}
                className="rounded-md border-none px-4 py-[7px] text-[12px] font-bold tracking-wide transition-all duration-200"
                style={{
                  background: active ? m.accent : "transparent",
                  color: active ? "#0a0a0a" : "#71717a",
                  cursor: "pointer",
                }}
              >
                {m.short}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
