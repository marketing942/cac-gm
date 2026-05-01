"use client";

import { createClient } from "@/lib/supabase/client";
import {
  BREAKEVEN_DEFAULTS,
  BREAKEVEN_PRODUCTS,
  type BreakevenAllData,
  type BreakevenData,
  type BreakevenProduct,
} from "./breakeven";

export async function loadBreakevenData(): Promise<BreakevenAllData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("breakeven_data")
    .select("product, data");

  if (error) throw error;

  const out: BreakevenAllData = {
    cppem: BREAKEVEN_DEFAULTS.cppem,
    unicv: BREAKEVEN_DEFAULTS.unicv,
  };

  for (const row of data ?? []) {
    const p = row.product as BreakevenProduct;
    if (BREAKEVEN_PRODUCTS.includes(p)) {
      out[p] = row.data as BreakevenData;
    }
  }

  return out;
}

export async function upsertBreakeven(
  product: BreakevenProduct,
  data: BreakevenData
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("breakeven_data")
    .upsert({ product, data }, { onConflict: "product" });
  if (error) throw error;
}

export async function seedBreakevenData(): Promise<void> {
  const supabase = createClient();
  const rows = BREAKEVEN_PRODUCTS.map((p) => ({
    product: p,
    data: BREAKEVEN_DEFAULTS[p],
  }));
  const { error } = await supabase.from("breakeven_data").insert(rows);
  if (error) throw error;
}
