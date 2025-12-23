"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import DesignChat from "./design";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f6f6f6] text-slate-900">
      {/* Mobile toggle */}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <main className="relative flex flex-1 bg-white">
        <div className="flex flex-1 items-center justify-center w-full ">
          <DesignChat />
        </div>
      </main>
    </div>
  );
}
