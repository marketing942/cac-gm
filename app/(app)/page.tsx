"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  INITIAL_DATA,
  INITIAL_YEAR,
  MONTHS,
  PRODUCT_META,
  computeCAC,
  createEmptyYear,
  loadStoredData,
  saveStoredData,
  fmt,
  fmtK,
  type CACData,
  type Product,
  type ProductData,
} from "@/lib/data";
import { Header } from "@/components/header";
import { KpiCard } from "@/components/kpi-card";
import { BarChart } from "@/components/bar-chart";
import { Tag } from "@/components/tag";
import { DetailTable } from "@/components/detail-table";
import { InvestmentSplit } from "@/components/investment-split";
import { EfficiencyGrid } from "@/components/efficiency-grid";
import { Projection } from "@/components/projection";

export default function Home() {
  const [data, setData] = useState<CACData>(INITIAL_DATA);
  const [year, setYear] = useState<number>(INITIAL_YEAR);
  const [prod, setProd] = useState<Product>("cppem");
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadStoredData();
    setData(stored);
    const yrs = Object.keys(stored).map(Number).sort((a, b) => b - a);
    if (yrs.length && !yrs.includes(year)) setYear(yrs[0]);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist changes after hydration
  useEffect(() => {
    if (hydrated) saveStoredData(data);
  }, [data, hydrated]);

  const years = useMemo(
    () => Object.keys(data).map(Number).sort((a, b) => a - b),
    [data]
  );

  const yearData = data[year] ?? createEmptyYear();
  const d = yearData[prod];
  const comp = useMemo(() => computeCAC(d), [d]);

  const meta = PRODUCT_META[prod];
  const accent = meta.accent;
  const label = meta.label;

  const updateField = useCallback(
    (field: keyof ProductData, idx: number, value: number) => {
      setData((prev) => {
        const next: CACData = { ...prev };
        const yd = next[year] ? { ...next[year] } : createEmptyYear();
        const pd: ProductData = {
          maxCAC: [...yd[prod].maxCAC],
          custoMkt: [...yd[prod].custoMkt],
          custoCom: [...yd[prod].custoCom],
          clientes: [...yd[prod].clientes],
        };
        pd[field][idx] = value;
        yd[prod] = pd;
        next[year] = yd;
        return next;
      });
    },
    [prod, year]
  );

  const addYear = useCallback(() => {
    setData((prev) => {
      const existing = Object.keys(prev).map(Number);
      const nextY =
        (existing.length ? Math.max(...existing) : INITIAL_YEAR - 1) + 1;
      if (prev[nextY]) {
        setYear(nextY);
        return prev;
      }
      setYear(nextY);
      return { ...prev, [nextY]: createEmptyYear() };
    });
  }, []);

  const removeYear = useCallback(
    (y: number) => {
      setData((prev) => {
        const keys = Object.keys(prev).map(Number);
        if (keys.length <= 1) return prev;
        const next: CACData = { ...prev };
        delete next[y];
        if (year === y) {
          const remaining = Object.keys(next).map(Number).sort((a, b) => b - a);
          setYear(remaining[0]);
        }
        return next;
      });
    },
    [year]
  );

  return (
    <div className="min-h-screen bg-surface-0 text-fg">
      <Header
        product={prod}
        year={year}
        years={years}
        onProductChange={setProd}
        onYearChange={setYear}
        onAddYear={addYear}
        onRemoveYear={removeYear}
      />

      <main className="mx-auto max-w-[1200px] px-7 py-6">
        {/* ── KPIs ── */}
        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="CAC Médio Real"
            value={comp.avgCAC != null ? fmt(comp.avgCAC) : "—"}
            sub={`Teto médio: ${fmt(comp.avgMax)}`}
            color={
              comp.avgCAC != null && comp.avgCAC <= comp.avgMax
                ? "#a3e635"
                : "#f87171"
            }
            delay={0}
          />
          <KpiCard
            label="Investimento Total"
            value={fmtK(comp.totalInv)}
            sub={`MKT ${fmtK(comp.totalMkt)} · COM ${fmtK(comp.totalCom)}`}
            color={accent}
            delay={70}
          />
          <KpiCard
            label="Clientes Adquiridos"
            value={comp.totalCli.toLocaleString("pt-BR")}
            sub={`${comp.activeMonths} ${comp.activeMonths === 1 ? "mês" : "meses"} preenchidos`}
            color="#fbbf24"
            delay={140}
          />
          <KpiCard
            label="Status"
            value={
              comp.overCount > 0
                ? `${comp.overCount} estouro${comp.overCount > 1 ? "s" : ""}`
                : comp.activeMonths > 0
                ? "Dentro do teto"
                : "Sem dados"
            }
            sub={`${comp.okCount} meses OK`}
            color={
              comp.overCount > 0
                ? "#f87171"
                : comp.activeMonths > 0
                ? "#a3e635"
                : "#52525b"
            }
            delay={210}
          />
        </div>

        {/* ── Chart ── */}
        <div className="mb-6 rounded-xl border border-zinc-850 bg-surface-1 px-5 py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[15px] font-extrabold tracking-tight">
                CAC Máximo vs Real — {label} · {year}
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-600">
                Comparativo mensal de custo de aquisição
              </div>
            </div>
            <div className="flex gap-3.5 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-white/[0.06]" />
                Teto
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #a3e635, #65a30d)",
                  }}
                />
                Real OK
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{
                    background:
                      "linear-gradient(180deg, #f87171, #b91c1c)",
                  }}
                />
                Estourou
              </span>
            </div>
          </div>
          <BarChart
            maxCAC={d.maxCAC}
            realCAC={comp.realCAC}
            ceiling={comp.ceiling}
          />
        </div>

        {/* ── Alerts ── */}
        {comp.overCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-[10px] border border-red-400/10 bg-red-400/[0.04] px-[18px] py-3.5 animate-fade-in">
            <span className="mr-1 text-xs font-bold text-red-400">
              ⚠ ALERTAS
            </span>
            {comp.realCAC.map((r, i) => {
              if (r == null || d.maxCAC[i] <= 0 || r <= d.maxCAC[i]) return null;
              return (
                <Tag key={i} color="#fca5a5" bg="rgba(248,113,113,0.12)">
                  {MONTHS[i]}: {fmt(r)} (teto {fmt(d.maxCAC[i])})
                </Tag>
              );
            })}
          </div>
        )}

        {/* ── Detail Table ── */}
        <div className="mb-6">
          <DetailTable
            d={d}
            comp={comp}
            accent={accent}
            onUpdate={updateField}
          />
        </div>

        {/* ── Split + Efficiency ── */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
            <div className="mb-3.5 text-[13px] font-bold text-zinc-500">
              Distribuição do Investimento
            </div>
            <InvestmentSplit
              totalMkt={comp.totalMkt}
              totalCom={comp.totalCom}
              totalInv={comp.totalInv}
              accent={accent}
            />
          </div>

          <div className="rounded-xl border border-zinc-850 bg-surface-1 p-5">
            <div className="mb-3.5 text-[13px] font-bold text-zinc-500">
              Eficiência por Mês
            </div>
            <EfficiencyGrid realCAC={comp.realCAC} maxCAC={d.maxCAC} />
          </div>
        </div>

        {/* ── Projection ── */}
        <div className="mb-6">
          <Projection comp={comp} accent={accent} />
        </div>
      </main>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-zinc-900 px-7 py-3.5 text-[10px] text-zinc-700">
        <span>GM Educação · Controle de CAC · Multi-ano</span>
        <span>Cálculos em tempo real · Dados salvos no navegador</span>
      </footer>
    </div>
  );
}
