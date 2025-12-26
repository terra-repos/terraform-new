"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/app/_components/sidebar";

export type UserData = {
  firstName: string | null;
  lastName: string | null;
  pfpSrc: string | null;
} | null;

type LayoutShellProps = {
  children: ReactNode;
  user: UserData;
};

export default function LayoutShell({ children, user }: LayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen  text-slate-900">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          user={user}
        />
        <main className="relative flex flex-1 bg-[#FAFAFA]">
          <div className="flex flex-1 items-center justify-center w-full ">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
