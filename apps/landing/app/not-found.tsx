import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-6 py-12 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-brand-950 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <Link href="/" className="mb-10 inline-flex items-center" aria-label="Voltar ao inicio">
          <Image src="/logo.png" alt="AngoPress" width={190} height={52} className="h-11 w-auto" />
        </Link>

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Erro 404</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl title-strong">
          Pagina nao encontrada
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
          O link pode estar incorreto, ter expirado ou a pagina pode ter sido movida.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Voltar ao inicio
          </Link>
          <Link
            href="/noticias"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Ver noticias
          </Link>
        </div>
      </div>
    </main>
  )
}
