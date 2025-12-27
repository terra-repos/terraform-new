import type { Database } from "./database";

// The row type from user_generated_products table
export type UserGeneratedProduct =
  Database["public"]["Tables"]["user_generated_products"]["Row"];

// Strongly typed ProductData for the JSON field
export type ProductData = {
  customizations?: string[];
  dimensions?: { length: string; width: string; height: string };
  customDimensions?: { name: string; value: string; key?: string }[];
  notes?: string;
  referenceImages?: string[];
  estimatedSamplePrice?: number;
};

// Supabase can return either a single object or array depending on the relationship
export type SupabaseDesignResult =
  | UserGeneratedProduct
  | UserGeneratedProduct[]
  | null;

// Helper to normalize design from Supabase result
export function getDesign(
  result: SupabaseDesignResult
): UserGeneratedProduct | null {
  if (!result) return null;
  if (Array.isArray(result)) return result[0] || null;
  return result;
}

// Helper to safely get typed ProductData from the JSON field
export function getProductData(
  design: UserGeneratedProduct | null
): ProductData | null {
  if (!design?.product_data?.[0]) return null;
  return design.product_data[0] as ProductData;
}
