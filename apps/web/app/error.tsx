'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand-700">Erro</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Algo correu mal</h1>
        <p className="mt-3 text-neutral-500">
          Tente novamente. Se persistir, contacte o suporte AngoPress.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  )
}
