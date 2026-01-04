"use server";

import { createClient } from "@/lib/supabase/server";

type AddToCartResult = {
  success: boolean;
  error?: string;
  cartId?: string;
};

export async function addDesignToCart(designId: string): Promise<AddToCartResult> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify the design exists and belongs to the user
    const { data: design, error: designError } = await supabase
      .from("user_generated_products")
      .select("id")
      .eq("id", designId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (designError || !design) {
      console.error("Failed to fetch design:", designError);
      return { success: false, error: "Design not found" };
    }

    // Check if design is already in cart
    const { data: existingCartItem } = await supabase
      .from("user_carts")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("design_id", designId)
      .single();

    if (existingCartItem) {
      // If already in cart, increment quantity
      const { error: updateError } = await supabase
        .from("user_carts")
        .update({ quantity: existingCartItem.quantity + 1 })
        .eq("id", existingCartItem.id);

      if (updateError) {
        console.error("Failed to update cart quantity:", updateError);
        return { success: false, error: "Failed to update cart" };
      }

      return { success: true, cartId: existingCartItem.id };
    }

    // Add new item to cart
    const { data: cartItem, error: cartError } = await supabase
      .from("user_carts")
      .insert({
        user_id: user.id,
        design_id: designId,
        quantity: 1,
        source: "designs_page",
      })
      .select("id")
      .single();

    if (cartError || !cartItem) {
      console.error("Failed to add to cart:", cartError);
      return { success: false, error: "Failed to add to cart" };
    }

    return { success: true, cartId: cartItem.id };
  } catch (error) {
    console.error("Error in addDesignToCart:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
