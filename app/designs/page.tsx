import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DesignsGrid from "./designs-grid";
import { getDesign } from "@/types/extras";

export type UserDesign = {
  id: string;
  product_name: string | null;
  image_url: string | null;
  product_data: any[];
  created_at: string | null;
  updated_at: string | null;
  terra_product_id: string | null;
  messages: any[] | null;
  store_id: string | null;
};

async function getUserDesigns(): Promise<UserDesign[]> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch all user designs with product store_id
  const { data: designs, error } = await supabase
    .from("user_generated_products")
    .select(`
      *,
      products!terra_product_id (
        store_id
      )
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null) // Exclude soft-deleted designs
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch designs:", error);
    return [];
  }

  // 3. Normalize data and extract store_id
  return designs.map((design) => ({
    ...getDesign(design),
    store_id: (design.products as any)?.store_id || null,
  }));
}

export default async function DesignsPage() {
  const designs = await getUserDesigns();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">My Designs</h1>
          <p className="text-neutral-600 mt-2">
            View and manage all your product designs
          </p>
        </div>

        <DesignsGrid designs={designs} />
      </div>
    </div>
  );
}
