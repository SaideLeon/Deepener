"use client";

import { User } from "next-auth";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <Navbar user={user} />
      <div className="flex flex-col md:flex-row h-[calc(100vh-1rem)] pt-16">
        <div className="w-full md:w-auto">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}