"use server";

import { createClient } from "@/lib/supabase/server";

type DuplicateDesignResult = {
  success: boolean;
  error?: string;
  designId?: string;
};

export async function duplicateDesign(
  designId: string
): Promise<DuplicateDesignResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch the original design
    const { data: originalDesign, error: fetchError } = await supabase
      .from("user_generated_products")
      .select("*")
      .eq("id", designId)
      .eq("user_id", user.id)  // Security: ensure user owns the design
      .single();

    if (fetchError || !originalDesign) {
      console.error("Failed to fetch original design:", fetchError);
      return { success: false, error: "Design not found" };
    }

    // Create duplicate with modified name
    const duplicateName = `${originalDesign.product_name || "Untitled"} (Copy)`;

    const { data: newDesign, error: createError } = await supabase
      .from("user_generated_products")
      .insert({
        user_id: user.id,
        product_name: duplicateName,
        image_url: originalDesign.image_url,
        product_data: originalDesign.product_data,
        messages: originalDesign.messages,
        product_type: originalDesign.product_type,
        provenance: originalDesign.provenance,
        init_prompt: originalDesign.init_prompt,
        // Note: DO NOT copy terra_product_id or variant_id
      })
      .select("id")
      .single();

    if (createError || !newDesign) {
      console.error("Failed to create duplicate:", createError);
      return { success: false, error: "Failed to duplicate design" };
    }

    return { success: true, designId: newDesign.id };
  } catch (error) {
    console.error("Error in duplicateDesign:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
