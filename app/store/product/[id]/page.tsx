import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Database } from "@/types/database";
import ProductEditor from "./_components/product-editor";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type Option = Database["public"]["Tables"]["options"]["Row"];
type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];

export type ProductWithRelations = Product & {
  product_variants: ProductVariant[];
  options: (Option & {
    option_values: OptionValue[];
  })[];
};

async function getProductWithVariants(
  productId: string
): Promise<ProductWithRelations | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's store
  const { data: store } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    redirect("/store");
  }

  // Get product with variants and options
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*),
      options (
        id,
        option_type,
        position,
        product_id,
        created_at,
        updated_at,
        option_values (*)
      )
    `
    )
    .eq("id", productId)
    .eq("store_id", store.id)
    .is("deleted_at", null)
    .single();

  if (!product) {
    return null;
  }

  return product as ProductWithRelations;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductEditorPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductWithVariants(id);

  if (!product) {
    notFound();
  }

  // Get organization ID for analytics
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organizationId = "";
  if (user) {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (orgMember) {
      organizationId = orgMember.organization_id;
    }
  }

  return <ProductEditor product={product} organizationId={organizationId} />;
}
