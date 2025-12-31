"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

type Option = Database["public"]["Tables"]["options"]["Row"];

export type CreateOptionResult = {
  success: boolean;
  error?: string;
  option?: Option;
};

export type DeleteOptionResult = {
  success: boolean;
  error?: string;
};

export async function createOption(
  productId: string,
  optionType: string
): Promise<CreateOptionResult> {
  const supabase = await createClient();
  const service = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's store
  const { data: store } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return { success: false, error: "No store found" };
  }

  // Verify product belongs to user's store
  const { data: product } = await service
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return { success: false, error: "Product not found" };
  }

  // Get existing options count for position
  const { count } = await service
    .from("options")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  // Create the option
  const { data: newOption, error: insertError } = await service
    .from("options")
    .insert({
      product_id: productId,
      option_type: optionType,
      position: (count || 0) + 1,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create option:", insertError);
    return { success: false, error: "Failed to create option" };
  }

  revalidatePath(`/store/product/${productId}`);

  return { success: true, option: newOption };
}

export async function deleteOption(
  optionId: string
): Promise<DeleteOptionResult> {
  const supabase = await createClient();
  const service = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's store
  const { data: store } = await service
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return { success: false, error: "No store found" };
  }

  // Get option with product info to verify ownership
  const { data: option } = await service
    .from("options")
    .select("id, product_id, products!inner(store_id)")
    .eq("id", optionId)
    .single();

  if (!option) {
    return { success: false, error: "Option not found" };
  }

  const productStoreId = (option.products as { store_id: string | null })
    ?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Option not found" };
  }

  // Delete associated option values first
  await service.from("option_values").delete().eq("option_id", optionId);

  // Delete the option
  const { error: deleteError } = await service
    .from("options")
    .delete()
    .eq("id", optionId);

  if (deleteError) {
    console.error("Failed to delete option:", deleteError);
    return { success: false, error: "Failed to delete option" };
  }

  revalidatePath(`/store/product/${option.product_id}`);

  return { success: true };
}
