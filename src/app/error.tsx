
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Algo deu errado!</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "Ocorreu um erro inesperado."}
        </p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="default"
        >
          Tentar Novamente
        </Button>
      </div>
    </div>
  )
}

    