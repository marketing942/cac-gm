"use client";

import { createClient } from "@/lib/supabase/client";
import { PRODUCTS, type Product } from "./data";
import {
  createEmptyRealizadoData,
  REALIZADO_CHANNELS,
  type RealizadoData,
  type RealizadoAllData,
} from "./realizado";

export async function loadRealizadoData(
  year: number
): Promise<RealizadoAllData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("realizado_data")
    .select("product, data")
    .eq("year", year);

  if (error) throw error;

  const out: RealizadoAllData = {
    cppem: createEmptyRealizadoData("cppem"),
    colegio: createEmptyRealizadoData("colegio"),
    unicv: createEmptyRealizadoData("unicv"),
  };

  for (const row of data ?? []) {
    const p = row.product as Product;
    if (PRODUCTS.includes(p)) {
      const raw = row.data as RealizadoData;
      const channels: Record<string, number[]> = {};
      for (const ch of REALIZADO_CHANNELS[p]) {
        channels[ch] = raw.channels?.[ch] ?? Array(12).fill(0);
      }
      const loaded: RealizadoData = {
        channels,
        qtd: raw.qtd ?? Array(12).fill(0),
        leads: raw.leads ?? Array(12).fill(0),
      };
      if (p === "unicv") {
        loaded.mensalidade = raw.mensalidade ?? Array(12).fill(0);
      }
      out[p] = loaded;
    }
  }

  return out;
}

export async function upsertRealizado(
  product: Product,
  year: number,
  data: RealizadoData
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("realizado_data").upsert(
    { product, year, data },
    { onConflict: "product,year" }
  );
  if (error) throw error;
}
