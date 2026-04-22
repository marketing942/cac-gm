"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PRODUCTS, PRODUCT_META, type Product } from "@/lib/data";
import {
  PACE_CONFIG,
  MONTH_NAMES,
  computePace,
  EMPTY_PACE_ENTRY,
  type PaceAllData,
  type PaceEntry,
  type PaceField,
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

function fmtCurrency(v: number): string {
  return (
    "R$ " +
    v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtInt(v: number): string {
  return Math.round(v).toLocaleString("pt-BR");
}

function fmtPct(v: number): string {
  return (v * 100).toFixed(1).replace(".", ",") + "%";
}

function fmtVal(v: number, unit: "currency" | "count"): string {
  return unit === "currency" ? fmtCurrency(v) : fmtInt(v);
}

function DeficitBadge({
  deficit,
  format,
}: {
  deficit: number;
  format: (v: number) => string;
}) {
  if (deficit === 0) return null;
  const isNeg = deficit > 0;
  return (
    <span
      className="ml-1 whitespace-nowrap rounded-full px-1.5 py-px text-[9px] font-bold"
      style={{
        color: isNeg ? "#f87171" : "#a3e635",
        background: isNeg ? "rgba(248,113,113,0.1)" : "rgba(163,230,53,0.1)",
      }}
    >
      {isNeg ? "−" : "+"}{format(Math.abs(deficit))}
    </span>
  );
}

function PaceInput({
  value,
  onChange,
  placeholder,
  highlight,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  highlight?: boolean;
}) {
  return (
    <input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={[
        "w-full rounded-md px-2 py-1.5 text-[12px] font-semibold text-fg outline-none transition-colors",
        highlight
          ? "border-[1.5px] border-dashed border-amber-400/50 bg-amber-400/[0.06] focus:border-amber-400 focus:bg-amber-400/10"
          : "border border-zinc-850 bg-surface-2 focus:border-zinc-700",
      ].join(" ")}
      style={{ fontFeatureSettings: "'tnum'" }}
      placeholder={placeholder || "0"}
    />
  );
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
  onUpdate: (field: PaceField, value: number) => void;
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

  const mainUnit = config.unit;
  const deficitVendas = entry.meta > 0 ? comp.metaIdealHoje - entry.realizado : 0;
  const deficitLeads = entry.metaLeads > 0 ? entry.metaLeads - entry.leadsRealizados : 0;
  const deficitTicket = entry.ticketMedioMeta > 0 ? entry.ticketMedioMeta - entry.ticketMedioReal : 0;
  const deficitConversao = entry.conversaoMeta > 0 ? entry.conversaoMeta - entry.conversaoReal : 0;

  return (
    <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
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

      {/* Progress bar */}
      <div className="mb-4">
        <div className="relative h-5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressWidth}%`, background: paceColor, opacity: 0.25 }}
          />
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressWidth}%`, background: paceColor }}
          />
          <div
            className="absolute top-0 h-full w-[2px] bg-fg/30"
            style={{ left: `${idealWidth}%` }}
            title={`Meta ideal: dia ${comp.diaAtual}/${comp.diasMes}`}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black"
            style={{ color: progressWidth > 45 ? "#0a0a0a" : undefined }}
          >
            {comp.pacePercent.toFixed(1)}%
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-fg-muted">
          <span>Dia {comp.diaAtual} de {comp.diasMes}</span>
          <span>Meta ideal: {((comp.diaAtual / comp.diasMes) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Data table */}
      <div className="space-y-1">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-1 px-1 pb-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-zinc-600">Indicador</span>
          <span className="text-center text-[9px] font-bold uppercase tracking-[0.5px] text-zinc-600">Meta</span>
          <span className="text-center text-[9px] font-bold uppercase tracking-[0.5px] text-zinc-600">Realizado</span>
        </div>

        {/* Vendas / Faturamento */}
        <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-1 rounded-lg border border-zinc-850 bg-surface-2 px-2 py-1.5">
          <span className="text-[10px] font-semibold text-fg-body">
            {mainUnit === "currency" ? "Faturamento" : "Vendas"}
          </span>
          <PaceInput
            value={entry.meta}
            onChange={(v) => onUpdate("meta", v)}
            placeholder={mainUnit === "currency" ? "R$" : "0"}
          />
          <div className="flex items-center">
            <PaceInput
              value={entry.realizado}
              onChange={(v) => onUpdate("realizado", v)}
              placeholder="0"
              highlight
            />
            <DeficitBadge deficit={deficitVendas} format={(v) => fmtVal(v, mainUnit)} />
          </div>
        </div>

        {/* Leads */}
        <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-1 rounded-lg border border-zinc-850 bg-surface-2 px-2 py-1.5">
          <span className="text-[10px] font-semibold text-fg-body">Leads</span>
          <PaceInput
            value={entry.metaLeads}
            onChange={(v) => onUpdate("metaLeads", v)}
          />
          <div className="flex items-center">
            <PaceInput
              value={entry.leadsRealizados}
              onChange={(v) => onUpdate("leadsRealizados", v)}
              highlight
            />
            <DeficitBadge deficit={deficitLeads} format={fmtInt} />
          </div>
        </div>

        {/* Ticket Médio (CPPEM only) */}
        {config.hasTicket && (
          <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-1 rounded-lg border border-zinc-850 bg-surface-2 px-2 py-1.5">
            <span className="text-[10px] font-semibold text-fg-body">Ticket Médio</span>
            <PaceInput
              value={entry.ticketMedioMeta}
              onChange={(v) => onUpdate("ticketMedioMeta", v)}
              placeholder="R$"
            />
            <div className="flex items-center">
              <PaceInput
                value={entry.ticketMedioReal}
                onChange={(v) => onUpdate("ticketMedioReal", v)}
                placeholder="R$"
                highlight
              />
              <DeficitBadge deficit={deficitTicket} format={fmtCurrency} />
            </div>
          </div>
        )}

        {/* Conversão */}
        <div className="grid grid-cols-[1fr_1fr_1fr] items-center gap-1 rounded-lg border border-zinc-850 bg-surface-2 px-2 py-1.5">
          <span className="text-[10px] font-semibold text-fg-body">Conversão</span>
          <PaceInput
            value={entry.conversaoMeta * 100}
            onChange={(v) => onUpdate("conversaoMeta", v / 100)}
            placeholder="%"
          />
          <div className="flex items-center">
            <PaceInput
              value={entry.conversaoReal * 100}
              onChange={(v) => onUpdate("conversaoReal", v / 100)}
              placeholder="%"
              highlight
            />
            <DeficitBadge deficit={deficitConversao} format={fmtPct} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between rounded-lg border border-zinc-850 bg-surface-2 px-3 py-1.5">
          <span className="text-[10px] font-medium text-fg-body">Pace atual</span>
          <span className="text-[13px] font-black" style={{ color: paceColor, fontFeatureSettings: "'tnum'" }}>
            {comp.pacePercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-zinc-850 bg-surface-2 px-3 py-1.5">
          <span className="text-[10px] font-medium text-fg-body">Projeção final</span>
          <span
            className="text-[13px] font-black"
            style={{
              color: comp.projecaoFinal >= entry.meta && entry.meta > 0 ? "#a3e635" : "#f87171",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {fmtVal(comp.projecaoFinal, mainUnit)}
          </span>
        </div>
      </div>
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
    (product: Product, field: PaceField, value: number) => {
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
            Verifique se as migrations
            <code className="mx-1 rounded bg-surface-2 px-1 py-0.5">pace_data</code>
            foram aplicadas no SQL Editor do Supabase.
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

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7">
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
