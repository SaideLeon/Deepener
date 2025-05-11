import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button
        onClick={() => signOut()}
        className="flex items-center gap-2"
        variant="outline"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    );
  }

  return (
    <Button
      onClick={() => signIn("google")}
      className="flex items-center gap-2"
      variant="outline"
    >
      <LogIn className="h-4 w-4" />
      Entrar com Google
    </Button>
  );
} 