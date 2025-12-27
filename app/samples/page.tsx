"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SamplesList from "./samples-list";

export default async function SamplesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/");
  }

  // Fetch cart items with their associated designs
  const { data: cartItems, error: cartError } = await supabase
    .from("user_carts")
    .select(
      `
      id,
      quantity,
      source,
      created_at,
      design_id,
      user_generated_products (
        id,
        product_name,
        image_url,
        product_data
      )
    `
    )
    .eq("user_id", user.id)
    .not("design_id", "is", null)
    .order("created_at", { ascending: false });

  if (cartError) {
    console.error("Failed to fetch cart items:", cartError);
  }

  return <SamplesList items={cartItems || []} />;
}
