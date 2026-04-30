import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Página não encontrada</h1>
        <p className="mt-3 text-neutral-500">O endereço pode ter mudado ou deixado de existir.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </main>
  )
}
