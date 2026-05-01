"use client";

import { createClient } from "@/lib/supabase/client";
import {
  INITIAL_DATA,
  PRODUCTS,
  createEmptyYear,
  type CACData,
  type Product,
  type ProductData,
} from "./data";

function emptyProductData(): ProductData {
  return {
    maxCAC: Array(12).fill(0),
    custoMkt: Array(12).fill(0),
    custoCom: Array(12).fill(0),
    clientes: Array(12).fill(0),
  };
}

export async function loadAllFromSupabase(): Promise<CACData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cac_data")
    .select("year, product, data");

  if (error) throw error;

  const out: CACData = {};
  for (const row of data ?? []) {
    const y = row.year as number;
    const p = row.product as Product;
    if (!out[y]) out[y] = createEmptyYear();
    out[y][p] = (row.data as ProductData) ?? emptyProductData();
  }

  for (const y of Object.keys(out).map(Number)) {
    for (const p of PRODUCTS) {
      if (!out[y][p]) out[y][p] = emptyProductData();
    }
  }

  return out;
}

export async function upsertProduct(
  year: number,
  product: Product,
  data: ProductData
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("cac_data")
    .upsert({ year, product, data }, { onConflict: "year,product" });
  if (error) throw error;
}

export async function deleteYear(year: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("cac_data").delete().eq("year", year);
  if (error) throw error;
}

export async function seedInitialData(): Promise<void> {
  const supabase = createClient();
  const rows: Array<{ year: number; product: Product; data: ProductData }> = [];
  for (const [y, yd] of Object.entries(INITIAL_DATA)) {
    for (const p of PRODUCTS) {
      rows.push({ year: Number(y), product: p, data: yd[p] });
    }
  }
  const { error } = await supabase.from("cac_data").insert(rows);
  if (error) throw error;
}
