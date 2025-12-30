"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];

export type CreateOptionValueResult = {
  success: boolean;
  error?: string;
  optionValue?: OptionValue;
};

export type DeleteOptionValueResult = {
  success: boolean;
  error?: string;
};

export async function createOptionValue(
  optionId: string,
  productId: string,
  value: string
): Promise<CreateOptionValueResult> {
  const supabase = await createClient();

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

  // Verify option belongs to user's product via store
  const { data: option } = await supabase
    .from("options")
    .select("id, product_id, products!inner(store_id)")
    .eq("id", optionId)
    .single();

  if (!option) {
    return { success: false, error: "Option not found" };
  }

  const productStoreId = (option.products as { store_id: string | null })?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Option not found" };
  }

  // Get existing option values count for position
  const { count } = await supabase
    .from("option_values")
    .select("*", { count: "exact", head: true })
    .eq("option_id", optionId);

  // Create the option value
  const { data: newValue, error: insertError } = await supabase
    .from("option_values")
    .insert({
      option_id: optionId,
      product_id: productId,
      value: value,
      position: (count || 0) + 1,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create option value:", insertError);
    return { success: false, error: "Failed to create option value" };
  }

  revalidatePath(`/store/product/${productId}`);

  return { success: true, optionValue: newValue };
}

export async function deleteOptionValue(
  valueId: string
): Promise<DeleteOptionValueResult> {
  const supabase = await createClient();

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

  // Get option value with product info to verify ownership
  const { data: optionValue } = await supabase
    .from("option_values")
    .select("id, product_id, options!inner(products!inner(store_id))")
    .eq("id", valueId)
    .single();

  if (!optionValue) {
    return { success: false, error: "Option value not found" };
  }

  const productStoreId = (
    optionValue.options as { products: { store_id: string | null } }
  )?.products?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Option value not found" };
  }

  // Delete the option value
  const { error: deleteError } = await supabase
    .from("option_values")
    .delete()
    .eq("id", valueId);

  if (deleteError) {
    console.error("Failed to delete option value:", deleteError);
    return { success: false, error: "Failed to delete option value" };
  }

  revalidatePath(`/store/product/${optionValue.product_id}`);

  return { success: true };
}
