export type BreakevenProduct = "cppem" | "unicv";

export const BREAKEVEN_PRODUCTS: BreakevenProduct[] = ["cppem", "unicv"];

export interface BreakevenParams {
  ticketMedio: number;
  margemMedia: number;
  salario: number;
  crm: number;
  chip: number;
  aliquotaFgts: number;
  aliquotaInss: number;
}

export interface ExtraCost {
  item: string;
  valor: number;
  obs: string;
}

export interface BreakevenData {
  params: BreakevenParams;
  extras: ExtraCost[];
}

export type BreakevenAllData = Record<BreakevenProduct, BreakevenData>;

function emptyExtras(): ExtraCost[] {
  return Array.from({ length: 6 }, () => ({ item: "", valor: 0, obs: "" }));
}

export const BREAKEVEN_DEFAULTS: BreakevenAllData = {
  cppem: {
    params: {
      ticketMedio: 600,
      margemMedia: 0.2,
      salario: 1621,
      crm: 40,
      chip: 45,
      aliquotaFgts: 0.08,
      aliquotaInss: 0.2,
    },
    extras: emptyExtras(),
  },
  unicv: {
    params: {
      ticketMedio: 150,
      margemMedia: 0.4,
      salario: 1621,
      crm: 40,
      chip: 45,
      aliquotaFgts: 0.08,
      aliquotaInss: 0.2,
    },
    extras: emptyExtras(),
  },
};

export interface BreakevenComputed {
  provisao13: number;
  baseEncargos: number;
  fgts: number;
  inssPatronal: number;
  custoFixoTotal: number;
  totalExtras: number;
  custoMensalTotal: number;
  breakevenReceita: number;
  breakevenVendas: number;
}

export function computeBreakeven(d: BreakevenData): BreakevenComputed {
  const { params, extras } = d;
  const provisao13 = params.salario / 12;
  const baseEncargos = params.salario + provisao13;
  const fgts = params.aliquotaFgts * baseEncargos;
  const inssPatronal = params.aliquotaInss * baseEncargos;
  const custoFixoTotal =
    params.crm + params.chip + params.salario + provisao13 + fgts + inssPatronal;
  const totalExtras = extras.reduce((sum, e) => sum + (e.valor || 0), 0);
  const custoMensalTotal = custoFixoTotal + totalExtras;
  const breakevenReceita =
    params.margemMedia > 0 ? custoMensalTotal / params.margemMedia : 0;
  const breakevenVendas =
    params.ticketMedio > 0 ? Math.ceil(breakevenReceita / params.ticketMedio) : 0;

  return {
    provisao13,
    baseEncargos,
    fgts,
    inssPatronal,
    custoFixoTotal,
    totalExtras,
    custoMensalTotal,
    breakevenReceita,
    breakevenVendas,
  };
}

export function createEmptyBreakevenData(): BreakevenData {
  return {
    params: {
      ticketMedio: 0,
      margemMedia: 0,
      salario: 0,
      crm: 0,
      chip: 0,
      aliquotaFgts: 0.08,
      aliquotaInss: 0.2,
    },
    extras: emptyExtras(),
  };
}

export const fmtBRL = (v: number): string =>
  "R$ " +
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtPctBE = (v: number): string =>
  (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "%";
