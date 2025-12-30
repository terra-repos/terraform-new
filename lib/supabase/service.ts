import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey)
    throw new Error("Service role client not configured");
  return createSupabaseClient<Database>(url, serviceKey);
}
