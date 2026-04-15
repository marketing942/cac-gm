// ─── Types ───
export type Product = "cppem" | "unicv";

export interface ProductData {
  maxCAC: number[];
  custoMkt: number[];
  custoCom: number[];
  clientes: number[];
}

export interface CACData {
  cppem: ProductData;
  unicv: ProductData;
}

// ─── Constants ───
export const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

// ─── Initial data (from spreadsheet CAC tab) ───
export const INITIAL_DATA: CACData = {
  cppem: {
    maxCAC:   [180, 180, 210, 195, 180, 180, 225, 210, 180, 180, 150, 150],
    custoMkt: [7011, 13853, 18202, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    custoCom: [5899, 9150, 12924, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clientes: [177, 122, 188, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  unicv: {
    maxCAC:   [700, 840, 1050, 1015, 910, 700, 630, 1400, 840, 910, 1610, 770],
    custoMkt: [5153, 6675, 8521, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    custoCom: [5010, 7800, 11115, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clientes: [220, 121, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

// ─── Computed values ───
export interface CACComputed {
  realCAC: (number | null)[];
  diff: (number | null)[];
  avgCAC: number | null;
  avgMax: number;
  totalCli: number;
  totalMkt: number;
  totalCom: number;
  totalInv: number;
  overCount: number;
  okCount: number;
  ceiling: number;
  activeMonths: number;
}

export function computeCAC(d: ProductData): CACComputed {
  const realCAC = d.clientes.map((c, i) =>
    c > 0 ? (d.custoMkt[i] + d.custoCom[i]) / c : null
  );
  const diff = realCAC.map((r, i) =>
    r != null ? (r - d.maxCAC[i]) / d.maxCAC[i] : null
  );
  const active = realCAC.filter((v): v is number => v != null);
  const avgCAC = active.length ? active.reduce((a, b) => a + b, 0) / active.length : null;
  const avgMax = d.maxCAC.reduce((a, b) => a + b, 0) / 12;
  const totalCli = d.clientes.reduce((a, b) => a + b, 0);
  const totalMkt = d.custoMkt.reduce((a, b) => a + b, 0);
  const totalCom = d.custoCom.reduce((a, b) => a + b, 0);
  const totalInv = totalMkt + totalCom;
  const overCount = realCAC.filter((r, i) => r != null && r > d.maxCAC[i]).length;
  const okCount = active.length - overCount;
  const ceiling = Math.max(...d.maxCAC, ...active, 1) * 1.15;

  return {
    realCAC, diff, avgCAC, avgMax, totalCli, totalMkt,
    totalCom, totalInv, overCount, okCount, ceiling,
    activeMonths: active.length,
  };
}

// ─── Formatters ───
export const fmt = (v: number | null | undefined): string =>
  v == null ? "—" : "R$ " + Math.round(v).toLocaleString("pt-BR");

export const fmtK = (v: number): string =>
  v >= 1000
    ? `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`
    : fmt(v);

export const fmtPct = (v: number | null): string =>
  v == null ? "—" : (v > 0 ? "+" : "") + (v * 100).toFixed(0) + "%";
