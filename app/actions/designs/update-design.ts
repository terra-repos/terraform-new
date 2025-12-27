"use server";

import { createClient } from "@/lib/supabase/server";

type UpdateDesignInput = {
  designId: string;
  productTitle: string;
  referenceImages: string[];
  customizations: string[];
  dimensions: { length: string; width: string; height: string };
  customDimensions: { name: string; value: string }[];
  notes: string;
  imageUrl: string;
};

type UpdateDesignResult =
  | { success: true }
  | { success: false; error: string };

export async function updateDesign(
  data: UpdateDesignInput
): Promise<UpdateDesignResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Build product_data JSON
  const productData = {
    customizations: data.customizations,
    dimensions: data.dimensions,
    customDimensions: data.customDimensions,
    notes: data.notes,
    referenceImages: data.referenceImages,
  };

  // Update user_generated_products
  const { error: updateError } = await supabase
    .from("user_generated_products")
    .update({
      product_name: data.productTitle,
      image_url: data.imageUrl || data.referenceImages[0] || null,
      product_data: [productData],
    })
    .eq("id", data.designId)
    .eq("user_id", user.id); // Ensure user owns this design

  if (updateError) {
    console.error("Failed to update design:", updateError);
    return { success: false, error: "Failed to update design" };
  }

  return { success: true };
}
