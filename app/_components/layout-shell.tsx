"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/app/_components/sidebar";
import { NotificationsProvider } from "@/app/_components/notifications-provider";

export type UserData = {
  firstName: string | null;
  lastName: string | null;
  pfpSrc: string | null;
} | null;

export type LayoutShellProps = {
  children: ReactNode;
  user: UserData;
  cartCount?: number;
  hasSampleOrders?: boolean;
  hasDeliveredOrder?: boolean;
};

export default function LayoutShell({
  children,
  user,
  cartCount = 0,
  hasSampleOrders = false,
  hasDeliveredOrder = false,
}: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NotificationsProvider>
        <div className="flex h-screen overflow-hidden text-slate-900">
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
            user={user}
            cartCount={cartCount}
            hasSampleOrders={hasSampleOrders}
            hasDeliveredOrder={hasDeliveredOrder}
          />
          <main className="relative flex-1 bg-[#FAFAFA] overflow-y-auto pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </NotificationsProvider>
    </ThemeProvider>
  );
}
