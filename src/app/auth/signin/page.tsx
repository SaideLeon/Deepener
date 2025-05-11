import { Metadata } from "next";
import { getProviders } from "next-auth/react";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Login | DeepPenAI",
  description: "Faça login para acessar sua conta",
};

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta para continuar
          </p>
        </div>
        <SignInForm providers={providers} />
      </div>
    </div>
  );
} 