"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { MONTHS, PRODUCTS, PRODUCT_META, type Product } from "@/lib/data";
import { YearSelect } from "@/components/year-select";
import type { MetasComputed } from "@/lib/metas";
import { useUser } from "@/components/user-provider";
import {
  computeMetas,
  createEmptyMetasData,
  fmtBRLMetas,
  fmtInt,
  fmtPctMetas,
  type MetasData,
} from "@/lib/metas";
import {
  loadMetasData,
  seedMetasData,
  upsertMetas,
  type MetasAllData,
} from "@/lib/metas-store";

type SyncState = "idle" | "saving" | "saved" | "error";

const INITIAL_YEAR = 2026;

function EditableNumber({
  value,
  onChange,
  prefix,
  suffix,
  readOnly = false,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setTmp(String(value)), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(Number(tmp) || 0);
  };

  if (readOnly) {
    return (
      <div
        className="px-1 py-0.5 text-right text-[12px] text-fg-body"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {prefix}
        {value ? value.toLocaleString("pt-BR") : "0"}
        {suffix}
      </div>
    );
  }

  if (editing) {
    return (
      <input
        ref={ref}
        autoFocus
        type="number"
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-full rounded border-[1.5px] border-amber-400 bg-amber-400/10 px-1 py-0.5 text-right text-[12px] text-fg outline-none"
        style={{ fontFeatureSettings: "'tnum'" }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clique para editar"
      className="cursor-pointer rounded border border-dashed border-amber-400/35 bg-amber-400/[0.06] px-1 py-0.5 text-right text-[12px] text-fg transition-colors hover:border-amber-400/60 hover:bg-amber-400/15"
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      {prefix}
      {value ? value.toLocaleString("pt-BR") : "0"}
      {suffix}
    </div>
  );
}

function EditablePct({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(String(Math.round(value * 100)));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setTmp(String(Math.round(value * 100))), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange((Number(tmp) || 0) / 100);
  };

  if (readOnly) {
    return (
      <div
        className="px-1 py-0.5 text-right text-[12px] text-fg-body"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {fmtPctMetas(value)}
      </div>
    );
  }

  if (editing) {
    return (
      <input
        ref={ref}
        autoFocus
        type="number"
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-full rounded border-[1.5px] border-amber-400 bg-amber-400/10 px-1 py-0.5 text-right text-[12px] text-fg outline-none"
        style={{ fontFeatureSettings: "'tnum'" }}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clique para editar"
      className="cursor-pointer rounded border border-dashed border-amber-400/35 bg-amber-400/[0.06] px-1 py-0.5 text-right text-[12px] text-fg transition-colors hover:border-amber-400/60 hover:bg-amber-400/15"
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      {fmtPctMetas(value)}
    </div>
  );
}

const CHART_W = 720;
const CHART_H = 220;
const CHART_PAD = { top: 30, right: 20, bottom: 28, left: 64 };
const CHART_PLOT_W = CHART_W - CHART_PAD.left - CHART_PAD.right;
const CHART_PLOT_H = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

function MetasLineChart({
  values,
  label,
  color,
  unit,
}: {
  values: number[];
  label: string;
  color: string;
  unit: "currency" | "count";
}) {
  const max = Math.max(...values, 1) * 1.15;

  function xPos(i: number) {
    return CHART_PAD.left + (i / 11) * CHART_PLOT_W;
  }
  function yPos(v: number) {
    return CHART_PAD.top + CHART_PLOT_H - (v / max) * CHART_PLOT_H;
  }
  function fmtLabel(v: number): string {
    if (unit === "currency") {
      if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
      return `R$ ${Math.round(v)}`;
    }
    return Math.round(v).toLocaleString("pt-BR");
  }

  const points = values
    .map((v, i) => (v > 0 ? `${xPos(i)},${yPos(v)}` : null))
    .filter(Boolean)
    .join(" ");

  const dots = values
    .map((v, i) => (v > 0 ? { cx: xPos(i), cy: yPos(v), val: v, idx: i } : null))
    .filter(Boolean) as { cx: number; cy: number; val: number; idx: number }[];

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((max / gridLines) * i)
  );

  return (
    <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
      <div className="mb-3 text-[13px] font-bold text-fg">{label}</div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" style={{ minWidth: 500 }}>
          {gridValues.map((v) => (
            <g key={v}>
              <line
                x1={CHART_PAD.left} y1={yPos(v)}
                x2={CHART_W - CHART_PAD.right} y2={yPos(v)}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
                strokeDasharray={v === 0 ? "none" : "3 3"}
              />
              <text
                x={CHART_PAD.left - 8} y={yPos(v) + 3}
                textAnchor="end"
                className="fill-zinc-400 dark:fill-zinc-600"
                fontSize={9} fontWeight={600}
                style={{ fontFeatureSettings: "'tnum'" }}
              >
                {fmtLabel(v)}
              </text>
            </g>
          ))}
          {MONTHS.map((m, i) => (
            <text
              key={i} x={xPos(i)} y={CHART_H - 6}
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-500"
              fontSize={10} fontWeight={600}
            >
              {m}
            </text>
          ))}
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {dots.map((dot) => (
            <g key={dot.idx}>
              <circle
                cx={dot.cx} cy={dot.cy} r={4.5}
                fill={color}
                stroke="white" strokeWidth={1.5}
                className="dark:stroke-zinc-900"
              />
              <text
                x={dot.cx} y={dot.cy - 10}
                textAnchor="middle"
                fill={color}
                fontSize={9} fontWeight={700}
                style={{ fontFeatureSettings: "'tnum'" }}
              >
                {fmtLabel(dot.val)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function getChartConfig(product: Product): { values: (comp: MetasComputed, d: MetasData) => number[]; label: string; unit: "currency" | "count" } {
  if (product === "cppem") {
    return {
      values: (_comp, d) => d.valorVender,
      label: "R$ Meta Faturamento",
      unit: "currency",
    };
  }
  return {
    values: (comp) => comp.vendasNecessarias,
    label: "Qtd Matrículas / Vendas",
    unit: "count",
  };
}

interface RowDef {
  key: string;
  label: string;
  editable: boolean;
  type: "currency" | "number" | "percent";
  field?: keyof MetasData;
  computedKey?: "leadsNecessario" | "vendasNecessarias" | "vendedoresNecessarios" | "capacidadeVenda";
}

const ROWS: RowDef[] = [
  { key: "valor", label: "Valor a vender total", editable: true, type: "currency", field: "valorVender" },
  { key: "leads", label: "Qtd de leads necessário", editable: false, type: "number", computedKey: "leadsNecessario" },
  { key: "pago", label: "Qtd pago", editable: true, type: "number", field: "qtdPago" },
  { key: "organico", label: "Qtd orgânico", editable: true, type: "number", field: "qtdOrganico" },
  { key: "conversao", label: "Conversão", editable: true, type: "percent", field: "conversao" },
  { key: "ticket", label: "Ticket Médio", editable: true, type: "currency", field: "ticketMedio" },
  { key: "vendas", label: "Qtd de vendas necessárias", editable: false, type: "number", computedKey: "vendasNecessarias" },
  { key: "leadsMax", label: "Leads máximo P/vendedor", editable: true, type: "number", field: "leadsMaxVendedor" },
  { key: "vendedores", label: "Vendedores necessários", editable: false, type: "number", computedKey: "vendedoresNecessarios" },
  { key: "capacidade", label: "Capacidade de venda P/vendedor", editable: false, type: "currency", computedKey: "capacidadeVenda" },
];

export default function MetasPage() {
  const { isAdmin } = useUser();
  const [allData, setAllData] = useState<MetasAllData | null>(null);
  const [prod, setProd] = useState<Product>("cppem");
  const [year, setYear] = useState<number>(INITIAL_YEAR);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  const lastSavedRef = useRef<MetasAllData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let loaded = await loadMetasData(year);
        const hasData = Object.values(loaded).some(
          (d) => d.valorVender.some((v) => v > 0)
        );
        if (!hasData && year === INITIAL_YEAR) {
          await seedMetasData(year);
          loaded = await loadMetasData(year);
        }
        lastSavedRef.current = structuredClone(loaded);
        setAllData(loaded);
      } catch (e) {
        console.error("Failed to load metas data", e);
        setLoadError(
          e instanceof Error ? e.message : "Erro desconhecido ao carregar dados."
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    if (!allData) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      if (!isAdmin) return;
      const prev = lastSavedRef.current;
      const tasks: Promise<void>[] = [];

      PRODUCTS.forEach((p) => {
        if (!prev || JSON.stringify(allData[p]) !== JSON.stringify(prev[p])) {
          tasks.push(upsertMetas(p, year, allData[p]));
        }
      });

      if (tasks.length === 0) return;

      setSyncState("saving");
      try {
        await Promise.all(tasks);
        lastSavedRef.current = structuredClone(allData);
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
  }, [allData, year]);

  const d = allData?.[prod] ?? createEmptyMetasData();
  const comp = useMemo(() => computeMetas(d), [d]);
  const meta = PRODUCT_META[prod];

  const updateCell = useCallback(
    (field: keyof MetasData, monthIdx: number, value: number) => {
      setAllData((prev) => {
        if (!prev) return prev;
        const arr = [...prev[prod][field]];
        arr[monthIdx] = value;
        return { ...prev, [prod]: { ...prev[prod], [field]: arr } };
      });
    },
    [prod]
  );

  function getMonthValue(row: RowDef, i: number): number {
    if (row.field) return d[row.field][i];
    if (row.computedKey) return comp[row.computedKey][i];
    return 0;
  }

  function getAnnualValue(row: RowDef): number {
    const a = comp.anual;
    const map: Record<string, number> = {
      valor: a.valorVender,
      leads: a.leadsNecessario,
      pago: a.qtdPago,
      organico: a.qtdOrganico,
      conversao: a.conversao,
      ticket: a.ticketMedio,
      vendas: a.vendasNecessarias,
      leadsMax: a.leadsMaxVendedor,
      vendedores: a.vendedoresNecessarios,
      capacidade: a.capacidadeVenda,
    };
    return map[row.key] ?? 0;
  }

  function formatValue(v: number, type: "currency" | "number" | "percent"): string {
    if (type === "currency") return fmtBRLMetas(v);
    if (type === "percent") return fmtPctMetas(v);
    return fmtInt(v);
  }

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
            <code className="mx-1 rounded bg-surface-2 px-1 py-0.5">metas_data</code>
            foi aplicada no SQL Editor do Supabase.
          </div>
        </div>
      </div>
    );
  }

  if (!allData) {
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
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-lg border border-zinc-850 shadow-lg"
            style={{ background: meta.badgeBg }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.logo} alt={meta.label} className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-[17px] font-extrabold tracking-tight">
              Desdobramento de Metas Anuais
            </div>
            <div className="text-[11px] font-medium text-zinc-600">
              {meta.label} · {year}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <YearSelect value={year} onChange={setYear} accent={meta.accent} />
          <div className="flex rounded-lg border border-zinc-850 bg-surface-2 p-[3px]">
            {PRODUCTS.map((p) => {
              const m = PRODUCT_META[p];
              const active = prod === p;
              return (
                <button
                  key={p}
                  onClick={() => setProd(p)}
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

      <main className="space-y-6 px-4 py-6 sm:px-7">
        <div className="overflow-x-auto rounded-xl border border-zinc-850 bg-surface-1">
          <table className="w-full min-w-[1100px] text-[12px]">
            <thead>
              <tr className="border-b border-zinc-850">
                <th className="sticky left-0 z-10 bg-surface-1 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[1px] text-zinc-500">
                  Indicador
                </th>
                {MONTHS.map((m) => (
                  <th
                    key={m}
                    className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[1px] text-zinc-500"
                    style={{ minWidth: 80 }}
                  >
                    {m}
                  </th>
                ))}
                <th
                  className="border-l border-zinc-850 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[1px]"
                  style={{ color: meta.accent, minWidth: 100 }}
                >
                  Ano
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => {
                const isSeparator = row.key === "conversao" || row.key === "vendas";
                return (
                  <tr
                    key={row.key}
                    className={[
                      "border-b border-zinc-850 last:border-0",
                      isSeparator ? "border-t-2 border-t-zinc-800" : "",
                      ri % 2 === 0 ? "" : "bg-surface-0/30",
                    ].join(" ")}
                  >
                    <td className="sticky left-0 z-10 bg-surface-1 px-4 py-2.5 text-[12px] font-semibold text-fg-body">
                      {row.label}
                    </td>
                    {MONTHS.map((_, i) => {
                      const val = getMonthValue(row, i);
                      const annualVal = getAnnualValue(row);
                      const showLeadPct =
                        (row.key === "pago" || row.key === "organico") &&
                        comp.leadsNecessario[i] > 0;
                      const leadPct = showLeadPct
                        ? Math.round((val / comp.leadsNecessario[i]) * 100)
                        : 0;
                      const showAnnualPct =
                        row.type !== "percent" && annualVal > 0 && val > 0;
                      const annualPct = showAnnualPct
                        ? Math.round((val / annualVal) * 100)
                        : 0;
                      return (
                        <td key={i} className="px-1.5 py-1.5">
                          {row.editable && row.field ? (
                            <div className="flex items-center gap-1">
                              <div className="flex-1">
                                {row.type === "percent" ? (
                                  <EditablePct
                                    value={val}
                                    onChange={(v) => updateCell(row.field!, i, v)}
                                    readOnly={!isAdmin}
                                  />
                                ) : (
                                  <EditableNumber
                                    value={val}
                                    onChange={(v) => updateCell(row.field!, i, v)}
                                    prefix={row.type === "currency" ? "R$ " : undefined}
                                    readOnly={!isAdmin}
                                  />
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-0">
                                {showAnnualPct && (
                                  <span className="whitespace-nowrap text-[8px] font-semibold text-zinc-500">
                                    {annualPct}%
                                  </span>
                                )}
                                {showLeadPct && (
                                  <span className="whitespace-nowrap text-[9px] font-bold text-fg-muted">
                                    {leadPct}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <div
                                className="px-1 py-0.5 text-right text-[12px] font-medium text-fg"
                                style={{ fontFeatureSettings: "'tnum'" }}
                              >
                                {formatValue(val, row.type)}
                              </div>
                              {showAnnualPct && (
                                <span className="whitespace-nowrap text-[8px] font-semibold text-zinc-500">
                                  {annualPct}%
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-l border-zinc-850 px-2 py-1.5">
                      <div
                        className="flex items-center justify-end gap-1 rounded px-1 py-0.5 text-right text-[12px] font-bold"
                        style={{
                          fontFeatureSettings: "'tnum'",
                          color: meta.accent,
                        }}
                      >
                        {formatValue(getAnnualValue(row), row.type)}
                        {(row.key === "pago" || row.key === "organico") &&
                          comp.anual.leadsNecessario > 0 && (
                            <span className="text-[9px] font-bold text-fg-muted">
                              {Math.round(
                                (getAnnualValue(row) / comp.anual.leadsNecessario) * 100
                              )}
                              %
                            </span>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(() => {
          const chartCfg = getChartConfig(prod);
          return (
            <MetasLineChart
              values={chartCfg.values(comp, d)}
              label={`${meta.label} · ${chartCfg.label}`}
              color={meta.accent}
              unit={chartCfg.unit}
            />
          );
        })()}
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 px-7 py-3.5 text-[10px] text-zinc-700">
        <span>GM Educação · Desdobramento de Metas Anuais</span>
        <span className="flex items-center gap-2">
          <span>Cálculos em tempo real · Dados compartilhados</span>
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
