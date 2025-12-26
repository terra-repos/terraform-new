import { type ReactNode } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import LayoutShell, { type UserData } from "@/app/_components/layout-shell";
import { createClient } from "@/lib/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <LayoutShell user={user}>{children}</LayoutShell>
      </body>
    </html>
  );
}
