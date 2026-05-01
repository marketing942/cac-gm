import type { Product } from "./data";

export interface PaceEntry {
  meta: number;
  realizado: number;
  metaLeads: number;
  leadsRealizados: number;
  ticketMedioMeta: number;
  ticketMedioReal: number;
  conversaoMeta: number;
  conversaoReal: number;
}

export type PaceField = keyof PaceEntry;

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
  hasTicket: boolean;
}

export const PACE_CONFIG: Record<Product, PaceProductConfig> = {
  cppem: {
    unit: "currency",
    realizadoLabel: "Vendas até hoje",
    metaSource: "valorVender",
    hasTicket: true,
  },
  colegio: {
    unit: "count",
    realizadoLabel: "Matrículas até hoje",
    metaSource: "vendasNecessarias",
    hasTicket: false,
  },
  unicv: {
    unit: "count",
    realizadoLabel: "Matrículas até hoje",
    metaSource: "vendasNecessarias",
    hasTicket: false,
  },
};

export const EMPTY_PACE_ENTRY: PaceEntry = {
  meta: 0,
  realizado: 0,
  metaLeads: 0,
  leadsRealizados: 0,
  ticketMedioMeta: 0,
  ticketMedioReal: 0,
  conversaoMeta: 0,
  conversaoReal: 0,
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
