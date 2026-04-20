"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { MONTHS, PRODUCTS, PRODUCT_META, YEARS, type Product } from "@/lib/data";
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
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
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
}: {
  value: number;
  onChange: (v: number) => void;
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
          <div className="flex items-center rounded-lg border border-zinc-850 bg-surface-2 p-[3px]">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className="rounded-md border-none px-3 py-[7px] text-[12px] font-bold transition-all duration-200"
                style={{
                  background: year === y ? meta.accent : "transparent",
                  color: year === y ? "#0a0a0a" : "#71717a",
                  cursor: "pointer",
                }}
              >
                {y}
              </button>
            ))}
          </div>
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

      <main className="px-4 py-6 sm:px-7">
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
                      const showPct =
                        (row.key === "pago" || row.key === "organico") &&
                        comp.leadsNecessario[i] > 0;
                      const pct = showPct
                        ? Math.round((val / comp.leadsNecessario[i]) * 100)
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
                                  />
                                ) : (
                                  <EditableNumber
                                    value={val}
                                    onChange={(v) => updateCell(row.field!, i, v)}
                                    prefix={row.type === "currency" ? "R$ " : undefined}
                                  />
                                )}
                              </div>
                              {showPct && (
                                <span className="whitespace-nowrap text-[9px] font-bold text-fg-muted">
                                  {pct}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              className="px-1 py-0.5 text-right text-[12px] font-medium text-fg"
                              style={{ fontFeatureSettings: "'tnum'" }}
                            >
                              {formatValue(val, row.type)}
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
