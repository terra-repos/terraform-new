"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkSlugAvailability(slug: string): Promise<{
  available: boolean;
  suggestion?: string;
}> {
  if (!slug || slug.length < 3) {
    return { available: false };
  }

  const supabase = await createClient();

  // Check if slug exists
  const { data: existingStore } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!existingStore) {
    return { available: true };
  }

  // Slug is taken, suggest an alternative
  let suggestion = slug;
  let counter = 1;

  while (counter < 100) {
    const candidateSlug = `${slug}-${counter}`;
    const { data: check } = await supabase
      .from("drop_stores")
      .select("id")
      .eq("slug", candidateSlug)
      .single();

    if (!check) {
      suggestion = candidateSlug;
      break;
    }
    counter++;
  }

  return {
    available: false,
    suggestion: suggestion !== slug ? suggestion : undefined,
  };
}
