'use client'

import { signIn, ClientSafeProvider } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FcGoogle } from "react-icons/fc"

interface Props {
  providers: Record<string, ClientSafeProvider> | null
}

export default function SignInForm({ providers }: Props) {
  const searchParams = useSearchParams()
  const errorParam = searchParams?.get("error")
  const [error, setError] = useState("")

  useEffect(() => {
    if (errorParam === "OAuthSignin") {
      setError("Erro ao conectar com o Google. Tente novamente.")
    } else if (errorParam) {
      setError("Erro de autenticação. Verifique suas credenciais.")
    }
  }, [errorParam])

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {providers &&
        Object.values(providers).map((provider) =>
          provider.name === "Google" ? (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center w-full gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              <FcGoogle className="h-5 w-5" />
              Entrar com Google
            </button>
          ) : (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id)}
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 transition"
            >
              Entrar com {provider.name}
            </button>
          )
        )}
    </div>
  )
}
