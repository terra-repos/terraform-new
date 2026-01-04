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
  console.log("🚀 [submitSampleRequests] Starting sample request submission");
  const supabase = await createClient();
  const service = createServiceClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("👤 [submitSampleRequests] Auth check:", {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message
  });

  if (authError || !user) {
    console.error("❌ [submitSampleRequests] Auth failed");
    return { success: false, error: "Not authenticated" };
  }

  // Get user's organization with org details
  console.log("🏢 [submitSampleRequests] Fetching organization for user:", user.id);
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

  console.log("🏢 [submitSampleRequests] Org query result:", {
    hasOrgMembership: !!orgMembership,
    orgError: orgError?.message,
    orgData: orgMembership
  });

  if (orgError || !orgMembership) {
    console.error("❌ [submitSampleRequests] No organization found");
    return { success: false, error: "No organization found for user" };
  }

  const orgName = (orgMembership.organizations as unknown as { name: string })
    .name;

  console.log("🏢 [submitSampleRequests] Organization name:", orgName);

  // Count existing orders for this organization to generate order number
  const { count: existingOrderCount } = await service
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgMembership.organization_id);

  const orderNumber = `${orgName}-${String(
    (existingOrderCount || 0) + 1
  ).padStart(4, "0")}`;

  console.log("📝 [submitSampleRequests] Generated order number:", orderNumber, "from count:", existingOrderCount);

  // Fetch cart items with their designs
  console.log("🛒 [submitSampleRequests] Fetching cart items for user:", user.id);
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

  console.log("🛒 [submitSampleRequests] Cart query result:", {
    hasCartItems: !!cartItems,
    cartItemsCount: cartItems?.length,
    cartError: cartError?.message,
    cartItems: cartItems
  });

  if (cartError) {
    console.error("❌ [submitSampleRequests] Failed to fetch cart items:", cartError);
    return { success: false, error: "Failed to fetch cart items" };
  }

  if (!cartItems || cartItems.length === 0) {
    console.error("❌ [submitSampleRequests] No items in cart");
    return { success: false, error: "No sample requests in cart" };
  }

  // Cast to proper type
  const typedCartItems = cartItems as CartItemWithDesign[];

  // Calculate subtotal from estimated prices
  const subtotal = typedCartItems.reduce((sum, item) => {
    const productData = item.user_generated_products.product_data?.[0] as
      | ProductData
      | undefined;
    const price = productData?.estimatedSamplePrice || 100;
    return sum + price * item.quantity;
  }, 0);

  console.log("💰 [submitSampleRequests] Calculated subtotal:", subtotal, "from", typedCartItems.length, "items");

  // Create the order
  console.log("📦 [submitSampleRequests] Creating order with data:", {
    organization_id: orgMembership.organization_id,
    order_number: orderNumber,
    subtotal,
    user_email: user.email
  });

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

  console.log("📦 [submitSampleRequests] Order creation result:", {
    hasOrderRecord: !!orderRecord,
    orderId: orderRecord?.id,
    orderNumber: orderRecord?.order_number,
    orderError: orderError?.message
  });

  if (orderError || !orderRecord) {
    console.error("❌ [submitSampleRequests] Failed to create order:", orderError);
    return { success: false, error: "Failed to create order" };
  }

  // Create products, variants, and order items for each cart item
  console.log("🏭 [submitSampleRequests] Creating products for", typedCartItems.length, "cart items");
  const orderItems: OrderItem[] = [];

  for (const [index, item] of typedCartItems.entries()) {
    console.log(`📝 [submitSampleRequests] Processing cart item ${index + 1}/${typedCartItems.length}:`, {
      cartItemId: item.id,
      designId: item.design_id,
      quantity: item.quantity
    });

    const design = item.user_generated_products;
    const productData = design.product_data?.[0] as ProductData | undefined;

    console.log(`📝 [submitSampleRequests] Design data for item ${index + 1}:`, {
      productName: design.product_name,
      hasProductData: !!productData,
      estimatedPrice: productData?.estimatedSamplePrice
    });

    // Create product
    const productInsertData = {
      title: design.product_name || "Custom Design",
      slug: slugify(design.product_name || "custom-design"),
      thumbnail_image: design.image_url,
      important_details: [
        ...(productData?.customizations || []),
        ...(productData?.notes ? [productData.notes] : []),
      ],
      factory_id: "2788b33a-6042-4691-aaa2-88be20384199",
    };

    console.log(`🏭 [submitSampleRequests] Creating product ${index + 1}:`, productInsertData);

    const { data: productRecord, error: productError } = await service
      .from("products")
      .insert(productInsertData)
      .select("id")
      .single();

    console.log(`🏭 [submitSampleRequests] Product creation result ${index + 1}:`, {
      hasProduct: !!productRecord,
      productId: productRecord?.id,
      productError: productError?.message
    });

    if (productError || !productRecord) {
      console.error(`❌ [submitSampleRequests] Failed to create product ${index + 1}:`, productError);
      continue; // Skip this item but continue with others
    }

    // Create product variant
    const variantInsertData = {
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
    };

    console.log(`🎨 [submitSampleRequests] Creating variant ${index + 1}:`, variantInsertData);

    const { data: variantRecord, error: variantError } = await service
      .from("product_variants")
      .insert(variantInsertData)
      .select("id")
      .single();

    console.log(`🎨 [submitSampleRequests] Variant creation result ${index + 1}:`, {
      hasVariant: !!variantRecord,
      variantId: variantRecord?.id,
      variantError: variantError?.message
    });

    if (variantError || !variantRecord) {
      console.error(`❌ [submitSampleRequests] Failed to create variant ${index + 1}:`, variantError);
      continue;
    }

    // Update the user_generated_product to link to the new product/variant
    console.log(`🔗 [submitSampleRequests] Linking design ${index + 1} to product/variant`);
    const { error: updateError } = await supabase
      .from("user_generated_products")
      .update({
        terra_product_id: productRecord.id,
        variant_id: variantRecord.id,
      })
      .eq("id", design.id);

    if (updateError) {
      console.warn(`⚠️ [submitSampleRequests] Failed to link design ${index + 1}:`, updateError.message);
    }

    // Prepare order item
    const orderItemData: OrderItem = {
      order_id: orderRecord.id,
      variant_id: variantRecord.id,
      quantity: item.quantity,
      unit_price: productData?.estimatedSamplePrice || 100,
      total_price: (productData?.estimatedSamplePrice || 100) * item.quantity,
      status: "draft" as const,
    };

    console.log(`📋 [submitSampleRequests] Adding order item ${index + 1}:`, orderItemData);
    orderItems.push(orderItemData);
  }

  console.log(`✅ [submitSampleRequests] Processed all cart items. Total order items:`, orderItems.length);

  // Insert order items
  if (orderItems.length > 0) {
    console.log(`📋 [submitSampleRequests] Inserting ${orderItems.length} order items into database`);
    const { error: orderItemsError } = await service
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("❌ [submitSampleRequests] Failed to create order items:", orderItemsError);
      // Don't fail completely, order is still created
    } else {
      console.log("✅ [submitSampleRequests] Successfully created order items");
    }
  } else {
    console.warn("⚠️ [submitSampleRequests] No order items to insert (all cart items failed to process)");
  }

  // Clear the cart items that were processed
  const cartIdsToRemove = typedCartItems.map((item) => item.id);
  console.log(`🧹 [submitSampleRequests] Clearing ${cartIdsToRemove.length} cart items:`, cartIdsToRemove);

  const { error: deleteError } = await service
    .from("user_carts")
    .delete()
    .in("id", cartIdsToRemove);

  if (deleteError) {
    console.error("❌ [submitSampleRequests] Failed to clear cart:", deleteError);
    // Don't fail completely, order is still created
  } else {
    console.log("✅ [submitSampleRequests] Successfully cleared cart");
  }

  const result = {
    success: true as const,
    orderId: orderRecord.id,
    orderNumber: orderRecord.order_number || orderNumber,
  };

  console.log("🎉 [submitSampleRequests] Completed successfully:", result);
  return result;
}
