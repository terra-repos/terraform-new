import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StoreOnboarding from "./_components/store-onboarding";
import StoreDashboard, {
  type StoreProduct,
} from "./_components/store-dashboard";
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

  // First, let's see ALL products for this store (including deleted ones)
  const { data: allProducts, error: allError } = await supabase
    .from("products")
    .select("id, title, deleted_at")
    .eq("store_id", storeId);

  console.log("=== Store Products Debug ===");
  console.log("Store ID:", storeId);
  console.log("All products count:", allProducts?.length || 0);
  console.log("Products with deleted_at set:", allProducts?.filter(p => p.deleted_at !== null).length || 0);
  console.log("Products with deleted_at null:", allProducts?.filter(p => p.deleted_at === null).length || 0);
  if (allError) console.log("Error:", allError);

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
        ocean_shipping_cost,
        drop_custom_price,
        is_default
      )
    `
    )
    .eq("store_id", storeId)
    .is("deleted_at", null);

  console.log("Filtered products count:", products?.length || 0);

  // Debug: check products with/without variants
  const productsWithVariants = products?.filter(p => (p.product_variants as unknown[])?.length > 0) || [];
  const productsWithoutVariants = products?.filter(p => !(p.product_variants as unknown[])?.length) || [];
  console.log("Products with variants:", productsWithVariants.length);
  console.log("Products without variants:", productsWithoutVariants.length);
  if (productsWithoutVariants.length > 0) {
    console.log("Products missing variants:", productsWithoutVariants.map(p => ({ id: p.id, title: p.title })));
  }

  if (!products) return [];

  // Transform to get default variant's pricing info
  return products.map((product) => {
    const variants = product.product_variants as {
      id: string;
      price: number | null;
      ocean_shipping_cost: number | null;
      drop_custom_price: number | null;
      is_default: boolean | null;
    }[];

    const defaultVariant = variants?.find((v) => v.is_default) || variants?.[0];

    // Calculate profit per unit: dropCustomPrice - (price + ocean_shipping_cost)
    const dropCustomPrice = defaultVariant?.drop_custom_price ?? null;
    const basePrice =
      (defaultVariant?.price || 0) + (defaultVariant?.ocean_shipping_cost || 0);
    const profitPerUnit =
      dropCustomPrice !== null ? dropCustomPrice - basePrice : null;

    return {
      id: product.id,
      title: product.title,
      thumbnail_image: product.thumbnail_image,
      drop_custom_price: dropCustomPrice,
      profit_per_unit: profitPerUnit,
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
