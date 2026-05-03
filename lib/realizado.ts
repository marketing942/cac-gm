import type { Product } from "./data";

export interface RealizadoData {
  channels: Record<string, number[]>;
  qtd: number[];
  leads: number[];
  mensalidade?: number[];
}

export type RealizadoAllData = Record<Product, RealizadoData>;

export const REALIZADO_CHANNELS: Record<Product, string[]> = {
  cppem: ["Digitais e Online", "Presenciais", "Supletivo", "Físicos", "Mentoria"],
  colegio: ["Ensino Fundamental", "Ensino Médio", "Outros"],
  unicv: ["Matrículas e Bolsas R$"],
};

export interface RealizadoComputed {
  totalReceita: number[];
  ticketMedio: number[];
  conversao: number[];
  anual: {
    channels: Record<string, number>;
    totalReceita: number;
    qtd: number;
    leads: number;
    ticketMedio: number;
    conversao: number;
    mensalidade: number;
  };
}

export function createEmptyRealizadoData(product: Product): RealizadoData {
  const channels: Record<string, number[]> = {};
  for (const ch of REALIZADO_CHANNELS[product]) {
    channels[ch] = Array(12).fill(0);
  }
  const base: RealizadoData = { channels, qtd: Array(12).fill(0), leads: Array(12).fill(0) };
  if (product === "unicv") base.mensalidade = Array(12).fill(0);
  return base;
}

export function computeRealizado(d: RealizadoData): RealizadoComputed {
  const channelNames = Object.keys(d.channels);

  const totalReceita = Array.from({ length: 12 }, (_, i) =>
    channelNames.reduce((sum, ch) => sum + (d.channels[ch]?.[i] ?? 0), 0)
  );

  const ticketMedio = totalReceita.map((r, i) =>
    d.qtd[i] > 0 ? r / d.qtd[i] : 0
  );

  const conversao = d.leads.map((l, i) =>
    l > 0 ? d.qtd[i] / l : 0
  );

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const anualChannels: Record<string, number> = {};
  for (const ch of channelNames) {
    anualChannels[ch] = sum(d.channels[ch] ?? []);
  }

  const anualReceita = sum(totalReceita);
  const anualQtd = sum(d.qtd);
  const anualLeads = sum(d.leads);

  return {
    totalReceita,
    ticketMedio,
    conversao,
    anual: {
      channels: anualChannels,
      totalReceita: anualReceita,
      qtd: anualQtd,
      leads: anualLeads,
      ticketMedio: anualQtd > 0 ? anualReceita / anualQtd : 0,
      conversao: anualLeads > 0 ? anualQtd / anualLeads : 0,
      mensalidade: sum(d.mensalidade ?? []),
    },
  };
}
