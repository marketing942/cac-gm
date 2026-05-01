"use client";

import { createClient } from "@/lib/supabase/client";
import { PRODUCTS, type Product } from "./data";
import {
  METAS_INITIAL,
  createEmptyMetasData,
  type MetasData,
} from "./metas";

export type MetasAllData = Record<Product, MetasData>;

export async function loadMetasData(year: number): Promise<MetasAllData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("metas_data")
    .select("product, data")
    .eq("year", year);

  if (error) throw error;

  const out: MetasAllData = {
    cppem: createEmptyMetasData(),
    colegio: createEmptyMetasData(),
    unicv: createEmptyMetasData(),
  };

  for (const row of data ?? []) {
    const p = row.product as Product;
    if (PRODUCTS.includes(p)) {
      out[p] = row.data as MetasData;
    }
  }

  return out;
}

export async function upsertMetas(
  product: Product,
  year: number,
  data: MetasData
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("metas_data")
    .upsert({ product, year, data }, { onConflict: "product,year" });
  if (error) throw error;
}

export async function seedMetasData(year: number): Promise<void> {
  const supabase = createClient();
  const rows = PRODUCTS.map((p) => ({
    product: p,
    year,
    data: METAS_INITIAL[p],
  }));
  const { error } = await supabase.from("metas_data").insert(rows);
  if (error) throw error;
}
