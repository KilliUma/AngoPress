import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative min-h-screen px-6 py-12 overflow-hidden text-white bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bg-white rounded-full -top-24 -right-24 h-72 w-72 blur-3xl" />
        <div className="absolute bottom-0 w-56 h-56 rounded-full left-1/4 bg-brand-950 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center justify-center text-center">
        <Link href="/" className="inline-flex items-center mb-10" aria-label="Voltar ao inicio">
          <Image src="/logo.png" alt="AngoPress" width={190} height={92} className="w-auto h-30" />
        </Link>

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Erro 404</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl title-strong">
          Pagina nao encontrada
        </h1>
        <p className="max-w-xl mt-4 text-sm text-white/80 sm:text-base">
          O link pode estar incorreto, ter expirado ou a pagina pode ter sido movida.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 text-sm font-semibold transition-colors bg-white h-11 rounded-xl text-brand-700 hover:bg-brand-50"
          >
            Voltar ao inicio
          </Link>
          <Link
            href="/noticias"
            className="inline-flex items-center justify-center px-5 text-sm font-semibold text-white transition-colors border h-11 rounded-xl border-white/35 hover:bg-white/10"
          >
            Ver noticias
          </Link>
        </div>
      </div>
    </main>
  )
}
