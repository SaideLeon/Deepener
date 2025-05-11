'use client';

import { signIn, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { BuiltInProviderType } from "next-auth/providers";

interface SignInFormProps {
  providers: Awaited<ReturnType<typeof getProviders>>;
}

export default function SignInForm({ providers }: SignInFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Escolha seu método de login preferido
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {providers &&
          Object.values(providers).map((provider) => (
            <Button
              key={provider.name}
              variant="outline"
              onClick={() => signIn(provider.id as BuiltInProviderType)}
              className="w-full"
            >
              {provider.name === "Google" && (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Entrar com {provider.name}
            </Button>
          ))}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Política de Privacidade
          </a>
          .
        </div>
      </CardFooter>
    </Card>
  );
} 