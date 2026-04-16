"use client";

import { MONTHS, fmt, fmtK, fmtPct, type ProductData, type CACComputed } from "@/lib/data";
import { EditCell } from "./edit-cell";
import { Tag } from "./tag";

interface DetailTableProps {
  d: ProductData;
  comp: CACComputed;
  accent: string;
  onUpdate: (field: keyof ProductData, idx: number, value: number) => void;
}

const thCls =
  "sticky top-0 bg-surface-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[1px] text-zinc-600 border-b border-zinc-850";
const tdLabelCls =
  "whitespace-nowrap border-b border-zinc-900 px-3 py-2.5 text-[13px] font-semibold text-zinc-500";
const tdValCls =
  "border-b border-zinc-900 px-2 py-2.5 text-right text-[13px] text-fg-body";

export function DetailTable({ d, comp, onUpdate }: DetailTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-850 bg-surface-1">
      <div className="flex items-center justify-between px-5 pt-[18px]">
        <div>
          <div className="text-[15px] font-extrabold tracking-tight">
            Detalhamento Mensal
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-600">
            Linhas calculadas automaticamente · campos amarelos são editáveis
          </div>
        </div>
        <Tag color="#fbbf24" bg="rgba(251,191,36,0.1)">
          ✎ Editável
        </Tag>
      </div>

      <div className="overflow-x-auto pt-4">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={`${thCls} text-left`}>Indicador</th>
              {MONTHS.map((m) => (
                <th key={m} className={`${thCls} min-w-[80px] text-right`}>
                  {m}
                </th>
              ))}
              <th className={`${thCls} min-w-[90px] text-right`}>Média</th>
            </tr>
          </thead>
          <tbody>
            {/* Máximo CAC */}
            <tr>
              <td className={tdLabelCls}>
                Máximo CAC
                <span className="ml-1.5 text-[9px] text-amber-400/70">●</span>
              </td>
              {d.maxCAC.map((v, i) => (
                <td key={i} className="border-b border-zinc-900 px-1 py-1.5">
                  <EditCell
                    value={v}
                    onChange={(val) => onUpdate("maxCAC", i, val)}
                  />
                </td>
              ))}
              <td className={`${tdValCls} font-bold text-zinc-500`}>
                {(() => {
                  const valid = d.maxCAC.filter((v) => v > 0);
                  return valid.length
                    ? fmt(valid.reduce((a, b) => a + b, 0) / valid.length)
                    : "—";
                })()}
              </td>
            </tr>

            {/* Real CAC */}
            <tr className="bg-white/[0.01]">
              <td className={`${tdLabelCls} font-bold text-fg`}>
                Real CAC
              </td>
              {comp.realCAC.map((v, i) => {
                const over = v != null && v > d.maxCAC[i];
                return (
                  <td
                    key={i}
                    className={`${tdValCls} font-extrabold`}
                    style={{
                      color:
                        v != null
                          ? over
                            ? "#f87171"
                            : "#a3e635"
                          : "#3f3f46",
                    }}
                  >
                    {v != null ? fmt(v) : "—"}
                  </td>
                );
              })}
              <td
                className={`${tdValCls} font-extrabold`}
                style={{ color: "#a78bfa" }}
              >
                {comp.avgCAC != null ? fmt(comp.avgCAC) : "—"}
              </td>
            </tr>

            {/* Comparativo */}
            <tr>
              <td className={tdLabelCls}>Comparativo</td>
              {comp.diff.map((v, i) => (
                <td
                  key={i}
                  className={`${tdValCls} text-xs font-bold`}
                  style={{
                    color:
                      v != null
                        ? v <= 0
                          ? "#a3e635"
                          : "#f87171"
                        : "#3f3f46",
                  }}
                >
                  {fmtPct(v)}
                </td>
              ))}
              <td className={tdValCls}>—</td>
            </tr>

            {/* Separator */}
            <tr>
              <td colSpan={14} className="h-px bg-zinc-850" />
            </tr>

            {/* Custo MKT */}
            <tr>
              <td className={tdLabelCls}>
                Custo MKT
                <span className="ml-1.5 text-[9px] text-amber-400/70">●</span>
              </td>
              {d.custoMkt.map((v, i) => (
                <td key={i} className="border-b border-zinc-900 px-1 py-1.5">
                  <EditCell
                    value={v}
                    onChange={(val) => onUpdate("custoMkt", i, val)}
                  />
                </td>
              ))}
              <td className={`${tdValCls} font-semibold`}>
                {fmtK(comp.totalMkt)}
              </td>
            </tr>

            {/* Custo Comercial */}
            <tr className="bg-white/[0.01]">
              <td className={tdLabelCls}>
                Custo Comercial
                <span className="ml-1.5 text-[9px] text-amber-400/70">●</span>
              </td>
              {d.custoCom.map((v, i) => (
                <td key={i} className="border-b border-zinc-900 px-1 py-1.5">
                  <EditCell
                    value={v}
                    onChange={(val) => onUpdate("custoCom", i, val)}
                  />
                </td>
              ))}
              <td className={`${tdValCls} font-semibold`}>
                {fmtK(comp.totalCom)}
              </td>
            </tr>

            {/* Clientes */}
            <tr>
              <td className={tdLabelCls}>
                Clientes Adquiridos
                <span className="ml-1.5 text-[9px] text-amber-400/70">●</span>
              </td>
              {d.clientes.map((v, i) => (
                <td key={i} className="border-b border-zinc-900 px-1 py-1.5">
                  <EditCell
                    value={v}
                    onChange={(val) => onUpdate("clientes", i, val)}
                    width={66}
                  />
                </td>
              ))}
              <td
                className={`${tdValCls} text-[15px] font-extrabold text-fg`}
              >
                {comp.totalCli.toLocaleString("pt-BR")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
