'use client'

import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FcGoogle } from "react-icons/fc"

export default function SignInPage() {
  return (
    <Suspense>
      <SignInPageContent />
    </Suspense>
  );
}

function SignInPageContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (errorParam === "OAuthSignin") {
      setError("Erro ao conectar com o Google. Tente novamente.");
    } else if (errorParam) {
      setError("Erro de autenticação. Verifique suas credenciais.");
    }
  }, [errorParam]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md w-full max-w-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Faça login</h2>
        
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-md transition hover:shadow-lg hover:bg-gray-50 border border-gray-200"
            disabled={!agreed}
          >
            <FcGoogle className="h-5 w-5 text-red-500" />
            <span className="group-hover:text-blue-600 transition">Entrar com Google</span>
          </button>
        </div>
        
        <div className="mt-6 flex items-center gap-2 justify-center">
          <input
            id="agree"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="accent-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="agree" className="text-sm text-gray-600 select-none">
            Eu concordo com a
            <a href="/politica-e-termos" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              Política de Privacidade e os Termos de Serviço da DeepPenAI
            </a>
          </label>
        </div>
      </div>
    </div>
  );
}
