"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const TERRA_TEAM_EMAILS = [
  "lev@useterra.com",
  "evan@useterra.com",
  "geoffrey@useterra.com",
  "dylan@useterra.com",
];

export async function notifyProductCreated(
  productId: string,
  storeName: string,
  senderUserId?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const service = createServiceClient();

    // Get Terra team user IDs
    const { data: users, error: error2 } = await service
      .from("profiles")
      .select("user_id, email")
      .in("email", TERRA_TEAM_EMAILS);

    console.log(error2);

    if (!users || users.length === 0) {
      console.warn("No Terra team users found for product notification");
      return;
    }

    // Build notifications array
    const notifications = users.map((user) => ({
      user_id: user.user_id,
      sender_user_id: senderUserId || null,
      type: "product_needs_approval",
      message: `New product needs approval: "${storeName}"`,
      redirect_url: `/store/product/${productId}`,
      is_read: false,
    }));

    // Insert notifications
    const { error } = await service.from("notifications").insert(notifications);

    if (error) {
      console.error("Failed to create product notifications:", error);
    }
  } catch (error) {
    console.error("Error in notifyProductCreated:", error);
    // Don't throw - notification failure shouldn't break product creation
  }
}
