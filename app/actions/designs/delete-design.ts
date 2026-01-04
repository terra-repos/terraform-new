"use server";

import { createClient } from "@/lib/supabase/server";

type DeleteDesignResult = {
  success: boolean;
  error?: string;
};

export async function deleteDesign(designId: string): Promise<DeleteDesignResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Soft delete the design (set deleted_at)
    const { error } = await supabase
      .from("user_generated_products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", designId)
      .eq("user_id", user.id);  // Security: ensure user owns the design

    if (error) {
      console.error("Failed to delete design:", error);
      return { success: false, error: "Failed to delete design" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteDesign:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
