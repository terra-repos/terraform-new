"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const TERRA_TEAM_EMAILS = [
  "lev@useterra.com",
  "evan@useterra.com",
  "geoffrey@useterra.com",
  "dylan@useterra.com",
];

export async function notifyVariantCreated(
  productId: string,
  variantTitle: string | null,
  productTitle: string,
  senderUserId?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const service = createServiceClient();

    // Get Terra team user IDs
    const { data: users } = await service
      .from("profiles")
      .select("user_id, email")
      .in("email", TERRA_TEAM_EMAILS);

    if (!users || users.length === 0) {
      console.warn("No Terra team users found for variant notification");
      return;
    }

    // Build message
    const variantName = variantTitle || "Untitled variant";
    const message = `New variant needs approval for "${productTitle}": ${variantName}`;

    // Build notifications array
    const notifications = users.map((user) => ({
      user_id: user.user_id,
      sender_user_id: senderUserId || null,
      type: "variant_needs_approval",
      message: message,
      redirect_url: `/store/product/${productId}`,
      is_read: false,
    }));

    // Insert notifications
    const { error } = await service.from("notifications").insert(notifications);

    if (error) {
      console.error("Failed to create variant notifications:", error);
    }
  } catch (error) {
    console.error("Error in notifyVariantCreated:", error);
    // Don't throw - notification failure shouldn't break variant creation
  }
}
