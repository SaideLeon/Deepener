"use client";

import { useState } from "react";
import { User } from "next-auth";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Navbar fixa */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar user={user} />
      </div>

      {/* Botão de menu no mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
          <Menu />
        </Button>
      </div>

      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        {/* Sidebar no desktop e drawer no mobile */}
        <aside
          className={`
            fixed md:relative top-16 md:top-0 left-0 z-40 
            h-[calc(100vh-4rem)] md:h-auto w-64 bg-white shadow-md
            transform transition-transform duration-300 ease-in-out
            ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          `}
        >
          <Sidebar />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-1 sm:p-5 md:p-6 md:ml-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
