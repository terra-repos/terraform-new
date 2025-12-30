import { type ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import LayoutShell, { type UserData } from "@/app/_components/layout-shell";
import { createClient } from "@/lib/supabase/server";
import { NavigationProgress } from "./_components/NavigationProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

async function getUser(): Promise<UserData> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: userData } = await supabase
    .from("profiles")
    .select("first_name, last_name, pfp_src")
    .eq("user_id", authUser.id)
    .single();

  if (!userData) return null;

  return {
    firstName: userData.first_name,
    lastName: userData.last_name,
    pfpSrc: userData.pfp_src,
  };
}

async function getCartCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return 0;

  const { count } = await supabase
    .from("user_carts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authUser.id);

  return count || 0;
}

async function getHasSampleOrders(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return false;

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", authUser.id)
    .single();

  if (!orgMember) return false;

  // Check for any terraform orders
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgMember.organization_id)
    .eq("order_source", "terraform");

  return (count || 0) > 0;
}

async function getHasDeliveredOrder(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return false;

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", authUser.id)
    .single();

  if (!orgMember) return false;

  // Check for any order_items with status "delivered" in terraform orders
  const { count } = await supabase
    .from("order_items")
    .select("*, orders!inner(*)", { count: "exact", head: true })
    .eq("orders.organization_id", orgMember.organization_id)
    .eq("orders.order_source", "terraform")
    .eq("status", "shipped");

  return (count || 0) > 0;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [user, cartCount, hasSampleOrders, hasDeliveredOrder] =
    await Promise.all([
      getUser(),
      getCartCount(),
      getHasSampleOrders(),
      getHasDeliveredOrder(),
    ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <LayoutShell
          user={user}
          cartCount={cartCount}
          hasSampleOrders={hasSampleOrders}
          hasDeliveredOrder={hasDeliveredOrder}
        >
          <NavigationProgress />
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
