"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Settings,
  User,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Meus Trabalhos",
    icon: FileText,
    href: "/generated",
  },
  {
    label: "Atividades",
    icon: Activity,
    href: "/activity",
  },
  {
    label: "Perfil",
    icon: User,
    href: "/profile",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">  
      </div>
      <div className="flex-1 space-y-1 p-4">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                pathname === route.href && "bg-muted"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
} 