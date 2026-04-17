"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PRODUCT_META } from "@/lib/data";
import {
  BREAKEVEN_PRODUCTS,
  BREAKEVEN_DEFAULTS,
  computeBreakeven,
  fmtBRL,
  fmtPctBE,
  type BreakevenAllData,
  type BreakevenData,
  type BreakevenParams,
  type BreakevenProduct,
  type ExtraCost,
} from "@/lib/breakeven";
import {
  loadBreakevenData,
  seedBreakevenData,
  upsertBreakeven,
} from "@/lib/breakeven-store";

type SyncState = "idle" | "saving" | "saved" | "error";

function ParamField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-[13px] font-medium text-fg-body">{label}</span>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-[12px] font-semibold text-fg-muted">{prefix}</span>
        )}
        <input
          type="number"
          value={value || ""}
          step={step ?? 1}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-[100px] rounded-md border border-dashed border-amber-400/35 bg-amber-400/[0.08] px-2 py-1.5 text-right text-[13px] font-semibold text-fg outline-none transition-colors hover:border-amber-400/60 hover:bg-amber-400/15 focus:border-amber-400 focus:bg-amber-400/10"
          style={{ fontFeatureSettings: "'tnum'" }}
        />
        {suffix && (
          <span className="text-[12px] font-semibold text-fg-muted">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function CostRow({
  label,
  formula,
  value,
  obs,
}: {
  label: string;
  formula: string;
  value: number;
  obs?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-850 py-2.5 last:border-0">
      <span className="min-w-[140px] text-[13px] font-medium text-fg-body">
        {label}
      </span>
      <span className="flex-1 text-[11px] text-fg-muted">{formula}</span>
      <span
        className="text-[13px] font-semibold text-fg"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {fmtBRL(value)}
      </span>
      {obs && <span className="text-[10px] text-fg-muted">{obs}</span>}
    </div>
  );
}

export default function BreakevenPage() {
  const [data, setData] = useState<BreakevenAllData | null>(null);
  const [prod, setProd] = useState<BreakevenProduct>("cppem");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

  const lastSavedRef = useRef<BreakevenAllData | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let loaded = await loadBreakevenData();
        const hasData = Object.values(loaded).some(
          (d) => d.params.salario > 0 || d.params.ticketMedio > 0
        );
        if (!hasData) {
          await seedBreakevenData();
          loaded = await loadBreakevenData();
        }
        lastSavedRef.current = structuredClone(loaded);
        setData(loaded);
      } catch (e) {
        console.error("Failed to load breakeven data", e);
        setLoadError(
          e instanceof Error ? e.message : "Erro desconhecido ao carregar dados."
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (!data) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const prev = lastSavedRef.current;
      const tasks: Promise<void>[] = [];

      BREAKEVEN_PRODUCTS.forEach((p) => {
        if (
          !prev ||
          JSON.stringify(data[p]) !== JSON.stringify(prev[p])
        ) {
          tasks.push(upsertBreakeven(p, data[p]));
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
  }, [data]);

  const updateParam = useCallback(
    (key: keyof BreakevenParams, value: number) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [prod]: {
            ...prev[prod],
            params: { ...prev[prod].params, [key]: value },
          },
        };
      });
    },
    [prod]
  );

  const updateExtra = useCallback(
    (idx: number, field: keyof ExtraCost, value: string | number) => {
      setData((prev) => {
        if (!prev) return prev;
        const extras = prev[prod].extras.map((e, i) =>
          i === idx ? { ...e, [field]: value } : e
        );
        return {
          ...prev,
          [prod]: { ...prev[prod], extras },
        };
      });
    },
    [prod]
  );

  const d = data?.[prod] ?? BREAKEVEN_DEFAULTS[prod];
  const comp = useMemo(() => computeBreakeven(d), [d]);
  const meta = PRODUCT_META[prod];

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
            <code className="mx-1 rounded bg-surface-2 px-1 py-0.5">breakeven_data</code>
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
          <div className="text-[11px] font-medium text-fg-muted">
            Carregando dados…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 text-fg">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 bg-gradient-to-b from-white/[0.015] to-transparent px-7 py-5">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-lg border border-zinc-850 shadow-lg"
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
              Breakeven de Vendedor
            </div>
            <div className="text-[11px] font-medium text-zinc-600">
              {meta.label} · Custo mínimo para um vendedor se pagar
            </div>
          </div>
        </div>

        <div className="flex rounded-lg border border-zinc-850 bg-surface-2 p-[3px]">
          {BREAKEVEN_PRODUCTS.map((p) => {
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
      </header>

      <main className="mx-auto max-w-[1100px] px-7 py-6">
        {/* Breakeven summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-850 bg-surface-1 px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
              Custo mensal total
            </div>
            <div
              className="mt-1 text-[24px] font-black tracking-tight text-amber-500"
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {fmtBRL(comp.custoMensalTotal)}
            </div>
            <div className="mt-0.5 text-[10px] text-fg-muted">
              Fixos + encargos + extras
            </div>
          </div>
          <div className="rounded-xl border border-zinc-850 bg-surface-1 px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
              Breakeven em receita
            </div>
            <div
              className="mt-1 text-[24px] font-black tracking-tight"
              style={{ color: meta.accent, fontFeatureSettings: "'tnum'" }}
            >
              {fmtBRL(comp.breakevenReceita)}
            </div>
            <div className="mt-0.5 text-[10px] text-fg-muted">
              Receita mínima / mês
            </div>
          </div>
          <div className="rounded-xl border-2 bg-surface-1 px-5 py-4" style={{ borderColor: meta.accent }}>
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
              Breakeven em vendas
            </div>
            <div
              className="mt-1 text-[36px] font-black tracking-tight"
              style={{ color: meta.accent, fontFeatureSettings: "'tnum'" }}
            >
              {comp.breakevenVendas}
            </div>
            <div className="mt-0.5 text-[10px] text-fg-muted">
              Vendas mínimas / mês
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Parameters */}
          <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
            <div className="mb-3 text-[13px] font-bold text-zinc-500">
              Parâmetros
              <span className="ml-2 text-[10px] font-medium text-amber-500">
                edite os valores
              </span>
            </div>
            <div className="divide-y divide-zinc-850">
              <ParamField
                label="Ticket médio"
                value={d.params.ticketMedio}
                onChange={(v) => updateParam("ticketMedio", v)}
                prefix="R$"
              />
              <ParamField
                label="Margem média"
                value={d.params.margemMedia * 100}
                onChange={(v) => updateParam("margemMedia", v / 100)}
                suffix="%"
                step={0.5}
              />
              <ParamField
                label="Salário"
                value={d.params.salario}
                onChange={(v) => updateParam("salario", v)}
                prefix="R$"
              />
              <ParamField
                label="CRM"
                value={d.params.crm}
                onChange={(v) => updateParam("crm", v)}
                prefix="R$"
              />
              <ParamField
                label="Chip + créditos"
                value={d.params.chip}
                onChange={(v) => updateParam("chip", v)}
                prefix="R$"
              />
              <ParamField
                label="Alíquota FGTS"
                value={d.params.aliquotaFgts * 100}
                onChange={(v) => updateParam("aliquotaFgts", v / 100)}
                suffix="%"
                step={0.5}
              />
              <ParamField
                label="Alíquota INSS patronal"
                value={d.params.aliquotaInss * 100}
                onChange={(v) => updateParam("aliquotaInss", v / 100)}
                suffix="%"
                step={0.5}
              />
            </div>
          </div>

          {/* Right: Costs breakdown */}
          <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
            <div className="mb-3 text-[13px] font-bold text-zinc-500">
              Custos mensais (fixos e encargos)
            </div>
            <CostRow label="CRM" formula="Parâmetro" value={d.params.crm} />
            <CostRow
              label="Chip + créditos"
              formula="Parâmetro"
              value={d.params.chip}
            />
            <CostRow
              label="Salário"
              formula="Parâmetro"
              value={d.params.salario}
            />
            <CostRow
              label="Provisão 13º"
              formula="Salário ÷ 12"
              value={comp.provisao13}
              obs="1/12 do salário"
            />
            <CostRow
              label="Base de encargos"
              formula="Salário + 13º"
              value={comp.baseEncargos}
            />
            <CostRow
              label="FGTS"
              formula={`${fmtPctBE(d.params.aliquotaFgts)} × base`}
              value={comp.fgts}
            />
            <CostRow
              label="INSS patronal"
              formula={`${fmtPctBE(d.params.aliquotaInss)} × base`}
              value={comp.inssPatronal}
            />
            <div className="mt-2 flex items-center justify-between border-t border-zinc-850 pt-3">
              <span className="text-[13px] font-bold text-fg">
                Total fixos + encargos
              </span>
              <span
                className="text-[14px] font-bold text-fg"
                style={{ fontFeatureSettings: "'tnum'" }}
              >
                {fmtBRL(comp.custoFixoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Extras */}
        <div className="mt-6 rounded-xl border border-zinc-850 bg-surface-1 p-5">
          <div className="mb-3 text-[13px] font-bold text-zinc-500">
            Custos extras
            <span className="ml-2 text-[10px] font-medium text-amber-500">
              adicione/edite valores
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-850 text-[10px] font-semibold uppercase tracking-[1px] text-zinc-500">
                  <th className="pb-2 text-left">#</th>
                  <th className="pb-2 text-left">Item</th>
                  <th className="pb-2 text-right">Valor mensal (R$)</th>
                  <th className="pb-2 text-left pl-4">Observação</th>
                </tr>
              </thead>
              <tbody>
                {d.extras.map((ex, i) => (
                  <tr key={i} className="border-b border-zinc-850 last:border-0">
                    <td className="py-2 text-fg-muted">{i + 1}</td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={ex.item}
                        onChange={(e) => updateExtra(i, "item", e.target.value)}
                        placeholder="Nome do item"
                        className="w-full rounded-md border border-dashed border-amber-400/35 bg-amber-400/[0.08] px-2 py-1.5 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-muted/50 hover:border-amber-400/60 focus:border-amber-400"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        value={ex.valor || ""}
                        onChange={(e) =>
                          updateExtra(i, "valor", Number(e.target.value) || 0)
                        }
                        className="w-[100px] rounded-md border border-dashed border-amber-400/35 bg-amber-400/[0.08] px-2 py-1.5 text-right text-[13px] font-semibold text-fg outline-none transition-colors hover:border-amber-400/60 focus:border-amber-400"
                        style={{ fontFeatureSettings: "'tnum'", marginLeft: "auto", display: "block" }}
                      />
                    </td>
                    <td className="py-2 pl-4">
                      <input
                        type="text"
                        value={ex.obs}
                        onChange={(e) => updateExtra(i, "obs", e.target.value)}
                        placeholder="—"
                        className="w-full rounded-md border border-dashed border-amber-400/35 bg-amber-400/[0.08] px-2 py-1.5 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-muted/50 hover:border-amber-400/60 focus:border-amber-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="pt-3 text-[13px] font-bold text-fg">
                    Total custos extras
                  </td>
                  <td
                    className="pt-3 text-right text-[13px] font-bold text-fg"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {fmtBRL(comp.totalExtras)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 px-7 py-3.5 text-[10px] text-zinc-700">
        <span>GM Educação · Breakeven de Vendedor</span>
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
