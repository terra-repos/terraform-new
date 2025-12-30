import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StoreOnboarding from "./_components/store-onboarding";
import StoreDashboard, { type StoreProduct } from "./_components/store-dashboard";
import { Database } from "@/types/database";

type StoreData = Database["public"]["Tables"]["drop_stores"]["Row"];

async function getStore(): Promise<StoreData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: store } = await supabase
    .from("drop_stores")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return store;
}

async function getStoreProducts(storeId: string): Promise<StoreProduct[]> {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      thumbnail_image,
      product_variants (
        id,
        price,
        is_default
      )
    `
    )
    .eq("store_id", storeId)
    .is("deleted_at", null);

  if (!products) return [];

  // Transform to get default variant price
  return products.map((product) => {
    const variants = product.product_variants as unknown as {
      id: string;
      price: number | null;
      is_default: boolean | null;
    }[];

    const defaultVariant = variants?.find((v) => v.is_default) || variants?.[0];

    return {
      id: product.id,
      title: product.title,
      thumbnail_image: product.thumbnail_image,
      price: defaultVariant?.price ?? null,
    };
  });
}

export default async function StorePage() {
  const store = await getStore();

  if (!store) {
    return <StoreOnboarding />;
  }

  const products = await getStoreProducts(store.id);

  return <StoreDashboard store={store} products={products} />;
}
