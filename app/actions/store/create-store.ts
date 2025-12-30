"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateStoreInput = {
  storeName: string;
  slug: string;
  heroImage: string | null;
};

export type CreateStoreResult = {
  success: boolean;
  error?: string;
  storeId?: string;
};

export async function createStore(
  input: CreateStoreInput
): Promise<CreateStoreResult> {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) {
    return { success: false, error: "No organization found" };
  }

  // Validate inputs
  if (!input.storeName || input.storeName.length < 2) {
    return { success: false, error: "Store name must be at least 2 characters" };
  }

  if (input.storeName.length > 50) {
    return { success: false, error: "Store name must be less than 50 characters" };
  }

  if (!input.slug || input.slug.length < 3) {
    return { success: false, error: "Store URL must be at least 3 characters" };
  }

  if (input.slug.length > 30) {
    return { success: false, error: "Store URL must be less than 30 characters" };
  }

  // Final slug uniqueness check
  const { data: existingStore } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("slug", input.slug)
    .single();

  if (existingStore) {
    return { success: false, error: "This store URL is already taken" };
  }

  // Check if user already has a store
  const { data: userStore } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (userStore) {
    return { success: false, error: "You already have a store" };
  }

  // Create the store
  const { data: newStore, error: insertError } = await supabase
    .from("drop_stores")
    .insert({
      user_id: user.id,
      organization_id: orgMember.organization_id,
      store_name: input.storeName,
      slug: input.slug,
      hero_image: input.heroImage,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to create store:", insertError);
    return { success: false, error: "Failed to create store" };
  }

  revalidatePath("/store");

  return { success: true, storeId: newStore.id };
}
