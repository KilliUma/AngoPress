import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center text-center">
        <Image
          src="/logo.png"
          alt="AngoPress"
          width={180}
          height={50}
          className="mb-8 h-10 w-auto"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Erro 404</p>
        <h1 className="mt-2 text-3xl text-neutral-900 sm:text-4xl title-strong">
          Pagina nao encontrada
        </h1>
        <p className="mt-3 max-w-lg text-neutral-500">
          O endereco pode ter mudado ou deixado de existir. Pode voltar ao painel ou ir para a
          pagina inicial.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Ir para dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
          >
            Ir para inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
