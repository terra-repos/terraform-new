import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPageClient from "./_components/LandingPageClient";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to /home immediately
  if (user) {
    redirect("/home");
  }

  // Only render landing page for unauthenticated users
  return <LandingPageClient />;
}
