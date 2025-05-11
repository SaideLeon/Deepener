import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/app" className="text-xl font-bold">
              DeepPenAI
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/app/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/app/papers"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Papers
              </Link>
              <Link
                href="/app/profile"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 