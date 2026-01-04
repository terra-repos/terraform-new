"use server";

import { createClient } from "@/lib/supabase/server";

type CatalogItem = {
  id: string;
  category: string | null;
  materials: string | null;
  dimension: string | null;
  price_usd: number | null;
  price_cny: number | null;
  image_url: string | null;
  taobao_url: string | null;
  extra_details: string | null;
  created_at: string | null;
};

type GetCatalogItemResult =
  | { success: true; item: CatalogItem }
  | { success: false; error: string };

export async function getCatalogItem(
  itemId: string
): Promise<GetCatalogItemResult> {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Fetch catalog item with security check
  const { data: item, error } = await supabase
    .from("temp_catalog_items")
    .select("*")
    .eq("id", itemId)
    .is("user_id_lock", null) // CRITICAL: Security check
    .single();

  if (error || !item) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, item };
}
