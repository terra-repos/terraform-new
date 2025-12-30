"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database";
import type { ProductData } from "@/types/extras";

type Design = Database["public"]["Tables"]["user_generated_products"]["Insert"];
type Order = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Insert"];
type Product = Database["public"]["Tables"]["products"]["Insert"];
type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Insert"];

type CartItemWithDesign = {
  id: string;
  quantity: number;
  design_id: string;
  user_generated_products: Design;
};

type SubmitSampleRequestsResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // separate accents from letters
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s_]+/g, "-") // spaces/underscores to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens from ends
}

export async function submitSampleRequests(): Promise<SubmitSampleRequestsResult> {
  const supabase = await createClient();
  const service = createServiceClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's organization with org details
  const { data: orgMembership, error: orgError } = await service
    .from("organization_members")
    .select(
      `
      organization_id,
      organizations!inner (
        name
      )
    `
    )
    .eq("user_id", user.id)
    .single();

  if (orgError || !orgMembership) {
    return { success: false, error: "No organization found for user" };
  }

  console.log(orgMembership);

  const orgName = (orgMembership.organizations as unknown as { name: string })
    .name; // Count existing orders for this organization to generate order number
  const { count: existingOrderCount } = await service
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgMembership.organization_id);

  const orderNumber = `${orgName}-${String(
    (existingOrderCount || 0) + 1
  ).padStart(4, "0")}`;

  // Fetch cart items with their designs
  const { data: cartItems, error: cartError } = await service
    .from("user_carts")
    .select(
      `
      id,
      quantity,
      design_id,
      user_generated_products!inner (*)
    `
    )
    .eq("user_id", user.id)
    .not("design_id", "is", null);

  if (cartError) {
    console.error("Failed to fetch cart items:", cartError);
    return { success: false, error: "Failed to fetch cart items" };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "No sample requests in cart" };
  }

  // Cast to proper type
  const typedCartItems = cartItems as unknown as CartItemWithDesign[];

  // Calculate subtotal from estimated prices
  const subtotal = typedCartItems.reduce((sum, item) => {
    const productData = item.user_generated_products.product_data?.[0] as
      | ProductData
      | undefined;
    const price = productData?.estimatedSamplePrice || 100;
    return sum + price * item.quantity;
  }, 0);

  // Create the order
  const { data: orderRecord, error: orderError } = await service
    .from("orders")
    .insert({
      organization_id: orgMembership.organization_id,
      order_source: "terraform",
      order_number: orderNumber,
      status: "draft",
      subtotal,
      total_cost: subtotal,
      shipping_cost: 0,
      currency: "USD",
      created_by: user.id,
      contact_email: user.email,
      notes: "Sample request from Terraform design tool",
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRecord) {
    console.error("Failed to create order:", orderError);
    return { success: false, error: "Failed to create order" };
  }

  // Create products, variants, and order items for each cart item
  const orderItems: OrderItem[] = [];

  for (const item of typedCartItems) {
    const design = item.user_generated_products;
    const productData = design.product_data?.[0] as ProductData | undefined;

    // Create product
    const { data: productRecord, error: productError } = await service
      .from("products")
      .insert({
        title: design.product_name || "Custom Design",
        slug: slugify(design.product_name || "custom-design"),
        thumbnail_image: design.image_url,
        important_details: [
          ...(productData?.customizations || []),
          ...(productData?.notes ? [productData.notes] : []),
        ],
        factory_id: "2788b33a-6042-4691-aaa2-88be20384199",
      })
      .select("id")
      .single();

    if (productError || !productRecord) {
      console.error("Failed to create product:", productError);
      continue; // Skip this item but continue with others
    }

    // Create product variant
    const { data: variantRecord, error: variantError } = await service
      .from("product_variants")
      .insert({
        product_id: productRecord.id,
        title: `${design.product_name} - Variant`,
        price: productData?.estimatedSamplePrice,
        dimensions: {
          ...productData?.dimensions,
          ...Object.fromEntries(
            (productData?.customDimensions || []).map((d) => [
              d.name.toLowerCase(),
              d.value,
            ])
          ),
        },
        is_default: true,
        images: productData?.referenceImages
          ? productData.referenceImages.map((url) => ({ src: url }))
          : null,
      })
      .select("id")
      .single();

    if (variantError || !variantRecord) {
      console.error("Failed to create variant:", variantError);
      continue;
    }

    // Update the user_generated_product to link to the new product/variant
    await supabase
      .from("user_generated_products")
      .update({
        terra_product_id: productRecord.id,
        variant_id: variantRecord.id,
      })
      .eq("id", design.id);

    // Prepare order item
    orderItems.push({
      order_id: orderRecord.id,
      variant_id: variantRecord.id,
      quantity: item.quantity,
      unit_price: productData?.estimatedSamplePrice || 100,
      total_price: (productData?.estimatedSamplePrice || 100) * item.quantity,
      status: "draft",
    });
  }

  // Insert order items
  if (orderItems.length > 0) {
    const { error: orderItemsError } = await service
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Failed to create order items:", orderItemsError);
      // Don't fail completely, order is still created
    }
  }

  // Clear the cart items that were processed
  const cartIdsToRemove = typedCartItems.map((item) => item.id);
  const { error: deleteError } = await service
    .from("user_carts")
    .delete()
    .in("id", cartIdsToRemove);

  if (deleteError) {
    console.error("Failed to clear cart:", deleteError);
    // Don't fail completely, order is still created
  }

  return {
    success: true,
    orderId: orderRecord.id,
    orderNumber: orderRecord.order_number || orderNumber,
  };
}
