import type { Product } from "./data";

export interface PaceEntry {
  meta: number;
  realizado: number;
}

export type PaceAllData = Record<Product, PaceEntry>;

export interface PaceComputed {
  diasMes: number;
  diaAtual: number;
  metaIdealHoje: number;
  deficit: number;
  pacePercent: number;
  projecaoFinal: number;
}

export interface PaceProductConfig {
  unit: "currency" | "count";
  realizadoLabel: string;
  metaSource: "valorVender" | "vendasNecessarias";
}

export const PACE_CONFIG: Record<Product, PaceProductConfig> = {
  cppem: {
    unit: "currency",
    realizadoLabel: "Vendas até hoje",
    metaSource: "valorVender",
  },
  colegio: {
    unit: "count",
    realizadoLabel: "Matrículas até hoje",
    metaSource: "vendasNecessarias",
  },
  unicv: {
    unit: "count",
    realizadoLabel: "Matrículas até hoje",
    metaSource: "vendasNecessarias",
  },
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function computePace(
  entry: PaceEntry,
  year: number,
  month: number,
  today: Date
): PaceComputed {
  const diasMes = daysInMonth(year, month);

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const diaAtual = isCurrentMonth ? today.getDate() : diasMes;

  const metaIdealHoje =
    entry.meta > 0 ? (entry.meta / diasMes) * diaAtual : 0;
  const deficit = metaIdealHoje - entry.realizado;
  const pacePercent =
    entry.meta > 0 ? (entry.realizado / entry.meta) * 100 : 0;
  const projecaoFinal =
    diaAtual > 0 ? (entry.realizado / diaAtual) * diasMes : 0;

  return { diasMes, diaAtual, metaIdealHoje, deficit, pacePercent, projecaoFinal };
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
