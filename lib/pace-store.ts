"use client";

import { createClient } from "@/lib/supabase/client";
import { PRODUCTS, type Product } from "./data";
import { computeMetas, type MetasData } from "./metas";
import { PACE_CONFIG, type PaceAllData, type PaceEntry } from "./pace";

const EMPTY_ENTRY: PaceEntry = { meta: 0, realizado: 0 };

export async function loadPaceData(
  year: number,
  month: number
): Promise<PaceAllData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pace_data")
    .select("product, meta, realizado")
    .eq("year", year)
    .eq("month", month);

  if (error) throw error;

  const out: PaceAllData = {
    cppem: { ...EMPTY_ENTRY },
    colegio: { ...EMPTY_ENTRY },
    unicv: { ...EMPTY_ENTRY },
  };

  for (const row of data ?? []) {
    const p = row.product as Product;
    if (PRODUCTS.includes(p)) {
      out[p] = { meta: Number(row.meta), realizado: Number(row.realizado) };
    }
  }

  return out;
}

export async function autoFillMetasForMonth(
  year: number,
  month: number
): Promise<Partial<Record<Product, number>>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("metas_data")
    .select("product, data")
    .eq("year", year);

  if (error || !data) return {};

  const result: Partial<Record<Product, number>> = {};
  const monthIdx = month - 1;

  for (const row of data) {
    const p = row.product as Product;
    const metasData = row.data as MetasData;
    const config = PACE_CONFIG[p];

    if (config.metaSource === "valorVender") {
      result[p] = metasData.valorVender[monthIdx] ?? 0;
    } else {
      const comp = computeMetas(metasData);
      result[p] = comp.vendasNecessarias[monthIdx] ?? 0;
    }
  }

  return result;
}

export async function upsertPace(
  product: Product,
  year: number,
  month: number,
  entry: PaceEntry
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("pace_data").upsert(
    {
      product,
      year,
      month,
      meta: entry.meta,
      realizado: entry.realizado,
    },
    { onConflict: "product,year,month" }
  );
  if (error) throw error;
}
