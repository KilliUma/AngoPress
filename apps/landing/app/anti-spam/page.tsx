import type { CSSProperties } from 'react'
import Link from 'next/link'
import { NetworkBackground } from '@/components/landing/NetworkBackground'

const NETWORK_STYLE = {
  '--net-edge': 'rgb(255 255 255 / 0.22)',
  '--net-dot-outer': 'rgb(255 255 255 / 0.55)',
  '--net-dot-core': 'rgb(255 255 255 / 0.88)',
  '--net-travel': 'rgb(255 255 255 / 0.85)',
  '--net-avatar': 'rgb(255 255 255 / 0.88)',
} as CSSProperties

const sections = [
  {
    id: 'opt-out',
    title: 'Opt-out',
    content: 'Contactos que cancelam a recepção ficam bloqueados para novos envios na plataforma.',
  },
  {
    id: 'identificacao',
    title: 'Identificação do Remetente',
    content:
      'Todos os envios devem identificar claramente o remetente, permitindo que os jornalistas saibam exatamente quem está a enviar a comunicação.',
  },
  {
    id: 'contexto',
    title: 'Respeito Contextual',
    content:
      'Os press releases devem respeitar o contexto editorial dos jornalistas, garantindo relevância e adequação ao seu campo de cobertura.',
  },
  {
    id: 'descadastro',
    title: 'Link de Descadastro',
    content:
      'Todos os envios devem incluir um link de descadastro destacado, permitindo que os jornalistas se removam da lista de distribuição a qualquer momento.',
  },
]

export default function AntiSpamPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden sm:h-96 lg:h-[420px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0 opacity-30" style={NETWORK_STYLE}>
          <NetworkBackground />
        </div>
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />

        {/* Back Link */}
        <div className="absolute top-0 inset-x-0 px-4 py-4 sm:px-6 sm:py-6 z-10">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao site
            </Link>
          </div>
        </div>

        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 2v2m0 2v2m-6-8h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
              Política Anti-spam
            </p>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Política Anti-spam
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Diretrizes para garantir comunicações responsáveis e éticas na plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-600">
                Índice
              </p>
              <nav className="space-y-2">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-brand-100 text-xs font-bold text-brand-600 group-hover:bg-brand-200">
                      {i + 1}
                    </span>
                    <span className="text-neutral-700 group-hover:text-brand-700">{s.title}</span>
                  </a>
                ))}
              </nav>

              {/* Info Card */}
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
                  Importante
                </p>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  O cumprimento destas diretrizes é essencial para manter a qualidade das
                  comunicações e a confiança dos jornalistas.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="space-y-6 lg:col-span-3">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="group rounded-2xl border border-neutral-200 bg-gradient-to-br from-brand-50/50 to-neutral-50 p-8 transition-all duration-300 hover:border-neutral-300 hover:shadow-md scroll-mt-20"
              >
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-600/20">
                    {i + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">{s.title}</h2>
                    <div className="mt-0.5 h-1 w-12 rounded-full bg-gradient-to-r from-brand-500 to-brand-600" />
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">{s.content}</p>
              </section>
            ))}
          </article>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-brand-50 to-neutral-50 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Precisa de mais informações?
            </h2>
            <p className="mt-2 text-neutral-700">
              Consulte os nossos documentos legais e de suporte
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/privacidade"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-6 py-3 font-semibold text-brand-700 transition-all hover:border-brand-300 hover:bg-brand-50"
              >
                Política de Privacidade
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                href="/termos"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-50 px-6 py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
