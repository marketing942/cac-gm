// ─── Types ───
export type Product = "cppem" | "colegio" | "unicv";

export interface ProductData {
  maxCAC: number[];
  custoMkt: number[];
  custoCom: number[];
  clientes: number[];
}

export type YearData = Record<Product, ProductData>;
export type CACData = Record<number, YearData>;

// ─── Constants ───
export const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const PRODUCTS: Product[] = ["cppem", "colegio", "unicv"];

export const YEARS = [2026, 2027, 2028, 2029, 2030] as const;

export interface ProductMeta {
  label: string;
  short: string;
  accent: string;
  accent2: string;
  logo: string;
  badgeBg: string;
}

export const PRODUCT_META: Record<Product, ProductMeta> = {
  cppem: {
    label: "CPPEM",
    short: "CPPEM",
    accent: "#4ade80",
    accent2: "#22c55e",
    logo: "/logos/cppem.png",
    badgeBg: "#050505",
  },
  colegio: {
    label: "Colégio CPPEM",
    short: "Colégio",
    accent: "#fbbf24",
    accent2: "#f59e0b",
    logo: "/logos/colegio.png",
    badgeBg: "#0a1f3d",
  },
  unicv: {
    label: "Unicive",
    short: "Unicive",
    accent: "#10b981",
    accent2: "#0d9488",
    logo: "/logos/unicv.png",
    badgeBg: "#065f46",
  },
};

// ─── Empty data helpers ───
function emptyProductData(): ProductData {
  return {
    maxCAC:   Array(12).fill(0),
    custoMkt: Array(12).fill(0),
    custoCom: Array(12).fill(0),
    clientes: Array(12).fill(0),
  };
}

export function createEmptyYear(): YearData {
  return {
    cppem: emptyProductData(),
    colegio: emptyProductData(),
    unicv: emptyProductData(),
  };
}

// ─── Initial year ───
export const INITIAL_YEAR = 2026;

// ─── Initial data (from spreadsheet CAC tab, 2026) ───
export const INITIAL_DATA: CACData = {
  2026: {
    cppem: {
      maxCAC:   [180, 180, 210, 195, 180, 180, 225, 210, 180, 180, 150, 150],
      custoMkt: [7011, 13853, 18202, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      custoCom: [5899, 9150, 12924, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      clientes: [177, 122, 188, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    colegio: emptyProductData(),
    unicv: {
      maxCAC:   [700, 840, 1050, 1015, 910, 700, 630, 1400, 840, 910, 1610, 770],
      custoMkt: [5153, 6675, 8521, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      custoCom: [5010, 7800, 11115, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      clientes: [220, 121, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
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
    r != null && d.maxCAC[i] > 0 ? (r - d.maxCAC[i]) / d.maxCAC[i] : null
  );
  const active = realCAC.filter((v): v is number => v != null);
  const avgCAC = active.length ? active.reduce((a, b) => a + b, 0) / active.length : null;
  const validMax = d.maxCAC.filter((v) => v > 0);
  const avgMax = validMax.length ? validMax.reduce((a, b) => a + b, 0) / validMax.length : 0;
  const totalCli = d.clientes.reduce((a, b) => a + b, 0);
  const totalMkt = d.custoMkt.reduce((a, b) => a + b, 0);
  const totalCom = d.custoCom.reduce((a, b) => a + b, 0);
  const totalInv = totalMkt + totalCom;
  const overCount = realCAC.filter(
    (r, i) => r != null && d.maxCAC[i] > 0 && r > d.maxCAC[i]
  ).length;
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
