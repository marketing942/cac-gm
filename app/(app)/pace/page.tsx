"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PRODUCTS, PRODUCT_META, type Product } from "@/lib/data";
import {
  PACE_CONFIG,
  MONTH_NAMES,
  computePace,
  type PaceAllData,
  type PaceEntry,
} from "@/lib/pace";
import {
  loadPaceData,
  autoFillMetasForMonth,
  upsertPace,
} from "@/lib/pace-store";

type SyncState = "idle" | "saving" | "saved" | "error";

const NOW = new Date();
const CUR_YEAR = NOW.getFullYear();
const CUR_MONTH = NOW.getMonth() + 1;

function fmtVal(v: number, unit: "currency" | "count"): string {
  if (unit === "currency")
    return (
      "R$ " +
      v.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  return Math.round(v).toLocaleString("pt-BR");
}

function PaceCard({
  product,
  entry,
  year,
  month,
  onUpdate,
}: {
  product: Product;
  entry: PaceEntry;
  year: number;
  month: number;
  onUpdate: (field: "meta" | "realizado", value: number) => void;
}) {
  const meta = PRODUCT_META[product];
  const config = PACE_CONFIG[product];
  const today = new Date();
  const comp = useMemo(
    () => computePace(entry, year, month, today),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry, year, month]
  );

  const paceColor =
    comp.pacePercent >= 100
      ? "#a3e635"
      : comp.pacePercent >= 80
      ? "#fbbf24"
      : comp.pacePercent >= 50
      ? "#fb923c"
      : "#f87171";

  const progressWidth = Math.min(comp.pacePercent, 100);
  const idealWidth = comp.diasMes > 0 ? (comp.diaAtual / comp.diasMes) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-zinc-850"
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
          <div className="text-[15px] font-extrabold tracking-tight">
            {meta.label}
          </div>
          <div className="text-[10px] font-medium text-fg-muted">
            Relatório Comercial
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
            Meta mensal
          </label>
          <input
            type="number"
            value={entry.meta || ""}
            onChange={(e) => onUpdate("meta", Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-zinc-850 bg-surface-2 px-3 py-2 text-[14px] font-semibold text-fg outline-none transition-colors focus:border-amber-400/60"
            style={{ fontFeatureSettings: "'tnum'" }}
            placeholder={config.unit === "currency" ? "R$ 0,00" : "0"}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
            {config.realizadoLabel}
            <span className="ml-1.5 normal-case tracking-normal text-amber-500">
              (preencha aqui)
            </span>
          </label>
          <input
            type="number"
            value={entry.realizado || ""}
            onChange={(e) => onUpdate("realizado", Number(e.target.value) || 0)}
            className="w-full rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-400/[0.06] px-3 py-2.5 text-[16px] font-bold text-fg outline-none transition-colors focus:border-amber-400 focus:bg-amber-400/10"
            style={{ fontFeatureSettings: "'tnum'" }}
            placeholder={config.unit === "currency" ? "R$ 0,00" : "0"}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="relative h-5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressWidth}%`,
              background: paceColor,
              opacity: 0.25,
            }}
          />
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressWidth}%`, background: paceColor }}
          />
          {/* Ideal marker */}
          <div
            className="absolute top-0 h-full w-[2px] bg-fg/30"
            style={{ left: `${idealWidth}%` }}
            title={`Meta ideal: dia ${comp.diaAtual}/${comp.diasMes}`}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black"
            style={{
              color:
                progressWidth > 45 ? "#0a0a0a" : undefined,
            }}
          >
            {comp.pacePercent.toFixed(1)}%
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-fg-muted">
          <span>Dia {comp.diaAtual} de {comp.diasMes}</span>
          <span>Meta ideal: {((comp.diaAtual / comp.diasMes) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Computed stats */}
      <div className="space-y-2">
        <StatRow
          label="Meta ideal até hoje"
          value={fmtVal(comp.metaIdealHoje, config.unit)}
          color="#71717a"
        />
        <StatRow
          label={comp.deficit > 0 ? "Déficit" : "Superávit"}
          value={
            (comp.deficit > 0 ? "−" : "+") +
            " " +
            fmtVal(Math.abs(comp.deficit), config.unit)
          }
          color={comp.deficit > 0 ? "#f87171" : "#a3e635"}
        />
        <StatRow
          label="Pace atual"
          value={comp.pacePercent.toFixed(1) + "%"}
          color={paceColor}
          bold
        />
        <StatRow
          label="Projeção final"
          value={fmtVal(comp.projecaoFinal, config.unit)}
          color={comp.projecaoFinal >= entry.meta && entry.meta > 0 ? "#a3e635" : "#f87171"}
          bold
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-850 bg-surface-2 px-3 py-2">
      <span className="text-[11px] font-medium text-fg-body">{label}</span>
      <span
        className={[
          "text-[13px]",
          bold ? "font-black" : "font-semibold",
        ].join(" ")}
        style={{ color, fontFeatureSettings: "'tnum'" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PacePage() {
  const [data, setData] = useState<PaceAllData | null>(null);
  const year = CUR_YEAR;
  const month = CUR_MONTH;
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  const lastSavedRef = useRef<PaceAllData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadPaceData(year, month);

        const anyMeta = Object.values(loaded).some((e) => e.meta > 0);
        if (!anyMeta) {
          const metas = await autoFillMetasForMonth(year, month);
          PRODUCTS.forEach((p) => {
            if (metas[p] && metas[p]! > 0) {
              loaded[p].meta = metas[p]!;
            }
          });
        }

        lastSavedRef.current = structuredClone(loaded);
        setData(loaded);
      } catch (e) {
        console.error("Failed to load pace data", e);
        setLoadError(
          e instanceof Error ? e.message : "Erro desconhecido ao carregar dados."
        );
      }
    })();
  }, [year, month]);

  useEffect(() => {
    if (!data) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const prev = lastSavedRef.current;
      const tasks: Promise<void>[] = [];

      PRODUCTS.forEach((p) => {
        if (!prev || JSON.stringify(data[p]) !== JSON.stringify(prev[p])) {
          tasks.push(upsertPace(p, year, month, data[p]));
        }
      });

      if (tasks.length === 0) return;

      setSyncState("saving");
      try {
        await Promise.all(tasks);
        lastSavedRef.current = structuredClone(data);
        setSyncState("saved");
        if (savedFlashRef.current) clearTimeout(savedFlashRef.current);
        savedFlashRef.current = setTimeout(() => setSyncState("idle"), 1500);
      } catch (e) {
        console.error("Save failed", e);
        setSyncState("error");
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, year, month]);

  const handleUpdate = useCallback(
    (product: Product, field: "meta" | "realizado", value: number) => {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, [product]: { ...prev[product], [field]: value } };
      });
    },
    []
  );

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
        <div className="max-w-md rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <div className="mb-2 text-[13px] font-bold text-red-600 dark:text-red-400">
            Erro ao carregar dados
          </div>
          <div className="text-[12px] text-fg-body">{loadError}</div>
          <div className="mt-3 text-[11px] text-fg-muted">
            Verifique se a migration
            <code className="mx-1 rounded bg-surface-2 px-1 py-0.5">pace_data</code>
            foi aplicada no SQL Editor do Supabase.
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-850 border-t-amber-400" />
          <div className="text-[11px] font-medium text-fg-muted">Carregando dados…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 text-fg">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-gradient-to-b from-white/[0.015] to-transparent px-7 py-5">
        <div>
          <div className="text-[17px] font-extrabold tracking-tight">
            Calculadora de Pace
          </div>
          <div className="text-[11px] font-medium text-zinc-600">
            {MONTH_NAMES[month - 1]} de {year} · Dia {new Date().getDate()} de{" "}
            {new Date(year, month, 0).getDate()}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-7">
        <div className="grid gap-5 md:grid-cols-3">
          {PRODUCTS.map((p) => (
            <PaceCard
              key={p}
              product={p}
              entry={data[p]}
              year={year}
              month={month}
              onUpdate={(field, value) => handleUpdate(p, field, value)}
            />
          ))}
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 px-7 py-3.5 text-[10px] text-zinc-700">
        <span>GM Educação · Calculadora de Pace</span>
        <span className="flex items-center gap-2">
          <span>Dados compartilhados · Mês atual</span>
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-opacity",
              syncState === "saving"
                ? "bg-amber-400/10 text-amber-600 dark:text-amber-400"
                : syncState === "saved"
                ? "bg-lime-500/10 text-lime-600 dark:text-lime-400"
                : syncState === "error"
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "opacity-0",
            ].join(" ")}
          >
            {syncState === "saving"
              ? "Salvando…"
              : syncState === "saved"
              ? "✓ Salvo"
              : syncState === "error"
              ? "⚠ Erro ao salvar"
              : ""}
          </span>
        </span>
      </footer>
    </div>
  );
}
