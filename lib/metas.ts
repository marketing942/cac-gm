import type { Product } from "./data";

export interface MensalidadeConfig {
  baseAlunos: number;
  ticketMensalidade: number;
  churnPct: number;
}

export const DEFAULT_MENSALIDADE_CONFIG: MensalidadeConfig = {
  baseAlunos: 850,
  ticketMensalidade: 37,
  churnPct: 0.05,
};

export interface MetasData {
  valorVender: number[];
  receitaCategorias?: Record<string, number[]>;
  mensalidadeConfig?: MensalidadeConfig;
  qtdPago: number[];
  qtdOrganico: number[];
  conversao: number[];
  ticketMedio: number[];
  leadsMaxVendedor: number[];
}

export type MetasNumericField = Exclude<
  keyof MetasData,
  "receitaCategorias" | "mensalidadeConfig"
>;

export interface MetasCategoryDef {
  key: string;
  label: string;
  realizadoChannel: string;
}

export const METAS_REVENUE_CATEGORIES: Partial<Record<Product, MetasCategoryDef[]>> = {
  cppem: [
    { key: "Presenciais", label: "Presenciais", realizadoChannel: "Presenciais" },
    { key: "Digitais + Online", label: "Digitais + Online", realizadoChannel: "Digitais e Online" },
    { key: "Mentoria", label: "Mentoria", realizadoChannel: "Mentoria" },
    { key: "Físicos", label: "Físicos", realizadoChannel: "Físicos" },
  ],
};

export interface MetasComputed {
  leadsNecessario: number[];
  vendasNecessarias: number[];
  vendedoresNecessarios: number[];
  capacidadeVenda: number[];
  alunosAtivos: number[];
  repasse: number[];
  anual: {
    valorVender: number;
    leadsNecessario: number;
    qtdPago: number;
    qtdOrganico: number;
    conversao: number;
    ticketMedio: number;
    vendasNecessarias: number;
    leadsMaxVendedor: number;
    vendedoresNecessarios: number;
    capacidadeVenda: number;
    alunosAtivos: number;
    repasse: number;
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function avg(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0;
}

export function computeMetas(d: MetasData): MetasComputed {
  const leadsNecessario = d.qtdPago.map((p, i) => p + d.qtdOrganico[i]);

  const vendasNecessarias = leadsNecessario.map((l, i) =>
    Math.round(l * d.conversao[i])
  );

  const vendedoresNecessarios = leadsNecessario.map((l, i) =>
    d.leadsMaxVendedor[i] > 0
      ? Math.max(1, Math.round(l / d.leadsMaxVendedor[i]))
      : 0
  );

  const capacidadeVenda = d.leadsMaxVendedor.map(
    (lm, i) => lm * d.conversao[i] * d.ticketMedio[i]
  );

  // Mensalidade (Unicive)
  const cfg = d.mensalidadeConfig;
  const alunosAtivos: number[] = Array(12).fill(0);
  const repasse: number[] = Array(12).fill(0);

  if (cfg && cfg.baseAlunos > 0) {
    const pagantes: number[] = [];
    for (let i = 0; i < 12; i++) {
      if (i === 0) {
        alunosAtivos[i] = cfg.baseAlunos + vendasNecessarias[i];
      } else {
        alunosAtivos[i] =
          Math.round(alunosAtivos[i - 1] * (1 - cfg.churnPct)) +
          vendasNecessarias[i];
      }

      if (i === 0) {
        pagantes[i] = cfg.baseAlunos;
      } else if (i === 1) {
        pagantes[i] = Math.round(pagantes[i - 1] * (1 - cfg.churnPct));
      } else {
        pagantes[i] =
          Math.round(pagantes[i - 1] * (1 - cfg.churnPct)) +
          vendasNecessarias[i - 2];
      }

      repasse[i] = Math.round(pagantes[i] * cfg.ticketMensalidade);
    }
  }

  const totalLeads = sum(leadsNecessario);
  const totalVendas = sum(vendasNecessarias);
  const totalValor = sum(d.valorVender);

  const anual = {
    valorVender: totalValor,
    leadsNecessario: totalLeads,
    qtdPago: sum(d.qtdPago),
    qtdOrganico: sum(d.qtdOrganico),
    conversao: totalLeads > 0 ? totalVendas / totalLeads : 0,
    ticketMedio: totalVendas > 0 ? totalValor / totalVendas : 0,
    vendasNecessarias: totalVendas,
    leadsMaxVendedor: Math.round(avg(d.leadsMaxVendedor)),
    vendedoresNecessarios: Math.max(...vendedoresNecessarios, 0),
    capacidadeVenda: Math.round(avg(capacidadeVenda)),
    alunosAtivos: alunosAtivos[11] ?? 0,
    repasse: sum(repasse),
  };

  return {
    leadsNecessario,
    vendasNecessarias,
    vendedoresNecessarios,
    capacidadeVenda,
    alunosAtivos,
    repasse,
    anual,
  };
}

function emptyMonths(): number[] {
  return Array(12).fill(0);
}

export function createEmptyMetasData(): MetasData {
  return {
    valorVender: emptyMonths(),
    qtdPago: emptyMonths(),
    qtdOrganico: emptyMonths(),
    conversao: Array(12).fill(0.12),
    ticketMedio: emptyMonths(),
    leadsMaxVendedor: Array(12).fill(600),
  };
}

export const METAS_INITIAL: Record<Product, MetasData> = {
  cppem: {
    valorVender: [180000, 125000, 130000, 129000, 134000, 130000, 150000, 145000, 115000, 142000, 145000, 120000],
    qtdPago: [1625, 1128, 1006, 1290, 1210, 1174, 1083, 1122, 1038, 1282, 1257, 1300],
    qtdOrganico: [875, 608, 542, 695, 651, 632, 583, 604, 559, 690, 677, 700],
    conversao: [0.12, 0.12, 0.12, 0.10, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.15, 0.12],
    ticketMedio: [600, 600, 700, 650, 600, 600, 750, 700, 600, 600, 500, 500],
    leadsMaxVendedor: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600],
  },
  colegio: createEmptyMetasData(),
  unicv: {
    valorVender: [7000, 8400, 10500, 10150, 9100, 7000, 6300, 14000, 8400, 9100, 16100, 7700],
    qtdPago: [583, 700, 875, 846, 758, 583, 525, 1167, 700, 758, 1073, 642],
    qtdOrganico: [250, 300, 375, 363, 325, 250, 225, 500, 300, 325, 460, 275],
    conversao: [0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.15, 0.12],
    ticketMedio: [100, 150, 130, 100, 100, 100, 100, 100, 100, 100, 50, 100],
    leadsMaxVendedor: [700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700],
    mensalidadeConfig: {
      baseAlunos: 850,
      ticketMensalidade: 37,
      churnPct: 0.05,
    },
  },
};

export const fmtBRLMetas = (v: number): string =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtInt = (v: number): string =>
  Math.round(v).toLocaleString("pt-BR");

export const fmtPctMetas = (v: number): string =>
  (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%";
