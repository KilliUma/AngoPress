import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 bg-neutral-50">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-screen mx-auto text-center">
        <Image
          src="/logo.png"
          alt="AngoPress"
          width={180}
          height={50}
          className="w-auto mb-8 h-30"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Erro 404</p>
        <h1 className="mt-2 text-3xl text-neutral-900 sm:text-4xl title-strong">
          Pagina nao encontrada
        </h1>
        <p className="max-w-lg mt-3 text-neutral-500">
          O endereco pode ter mudado ou deixado de existir. Pode voltar ao painel ou ir para a
          pagina inicial.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-white rounded-lg bg-brand-600 hover:bg-brand-700"
          >
            Ir para dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            Ir para inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
