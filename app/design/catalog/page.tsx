import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CatalogGrid from "./catalog-grid";

export type CatalogItem = {
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

async function getCatalogItems(): Promise<CatalogItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch catalog items, excluding locked items
  const { data: catalogItems, error } = await supabase
    .from("temp_catalog_items")
    .select("*")
    .is("user_id_lock", null) // Critical: Filter out locked items
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch catalog items:", error);
    return [];
  }

  return (catalogItems || []).map((item) => ({
    id: item.id,
    category: item.category,
    materials: item.materials,
    dimension: item.dimension,
    price_usd: item.price_usd,
    price_cny: item.price_cny,
    image_url: item.image_url,
    taobao_url: item.taobao_url,
    extra_details: item.extra_details,
    created_at: item.created_at,
  }));
}

export default async function CatalogPage() {
  const items = await getCatalogItems();

  return <CatalogGrid items={items} />;
}
