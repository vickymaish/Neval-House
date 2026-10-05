import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { siteConfig } from "@/data/site";
import { property } from "@/data/property";

export type PublicSettings = { nightly_price_kes: number | null; max_guests: number; check_in_time: string; check_out_time: string; whatsapp_number: string; tagline: string; welcome_paragraph: string };
const fallback: PublicSettings = { nightly_price_kes: null, max_guests: 6, check_in_time: "2:00 PM", check_out_time: "12 noon", whatsapp_number: siteConfig.whatsappNumber, tagline: property.hero.title, welcome_paragraph: property.hero.description };

export const getPublicSettings = unstable_cache(async (): Promise<PublicSettings> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallback;
  const supabase = createSupabaseClient<Database>(url, key);
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error || !data) return fallback;
  const values = new Map(data.map((row) => [row.key, row.value]));
  const str = (keyName: string, defaultValue: string) => { const value = values.get(keyName); return typeof value === "string" ? value : defaultValue; };
  const num = (keyName: string, defaultValue: number | null) => { const value = values.get(keyName); return typeof value === "number" ? value : defaultValue; };
  return { nightly_price_kes: num("nightly_price_kes", fallback.nightly_price_kes), max_guests: num("max_guests", fallback.max_guests) ?? fallback.max_guests, check_in_time: str("check_in_time", fallback.check_in_time), check_out_time: str("check_out_time", fallback.check_out_time), whatsapp_number: str("whatsapp_number", fallback.whatsapp_number), tagline: str("tagline", fallback.tagline), welcome_paragraph: str("welcome_paragraph", fallback.welcome_paragraph) };
}, ["public-site-settings"], { revalidate: 60 });
