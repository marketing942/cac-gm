"use client";

import { createClient } from "@/lib/supabase/client";
import { PRODUCTS, type Product } from "./data";
import { computeMetas, type MetasData } from "./metas";
import {
  PACE_CONFIG,
  EMPTY_PACE_ENTRY,
  type PaceAllData,
  type PaceEntry,
} from "./pace";

export async function loadPaceData(
  year: number,
  month: number
): Promise<PaceAllData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pace_data")
    .select(
      "product, meta, realizado, meta_leads, leads_realizados, ticket_medio_meta, ticket_medio_real, conversao_meta, conversao_real"
    )
    .eq("year", year)
    .eq("month", month);

  if (error) throw error;

  const out: PaceAllData = {
    cppem: { ...EMPTY_PACE_ENTRY },
    colegio: { ...EMPTY_PACE_ENTRY },
    unicv: { ...EMPTY_PACE_ENTRY },
  };

  for (const row of data ?? []) {
    const p = row.product as Product;
    if (PRODUCTS.includes(p)) {
      out[p] = {
        meta: Number(row.meta),
        realizado: Number(row.realizado),
        metaLeads: Number(row.meta_leads),
        leadsRealizados: Number(row.leads_realizados),
        ticketMedioMeta: Number(row.ticket_medio_meta),
        ticketMedioReal: Number(row.ticket_medio_real),
        conversaoMeta: Number(row.conversao_meta),
        conversaoReal: Number(row.conversao_real),
      };
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
      meta_leads: entry.metaLeads,
      leads_realizados: entry.leadsRealizados,
      ticket_medio_meta: entry.ticketMedioMeta,
      ticket_medio_real: entry.ticketMedioReal,
      conversao_meta: entry.conversaoMeta,
      conversao_real: entry.conversaoReal,
    },
    { onConflict: "product,year,month" }
  );
  if (error) throw error;
}
