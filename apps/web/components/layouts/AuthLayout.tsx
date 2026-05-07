'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NetworkBackground } from './NetworkBackground'

const FEATURES = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
    title: 'Distribuição Inteligente',
    description:
      'Envie press releases para jornalistas segmentados por editoria, cidade e tipo de média.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
    title: 'Base de Jornalistas',
    description:
      'Aceda à maior base curada de jornalistas angolanos de TV, rádio, digital e imprensa.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
    title: 'Analytics em Tempo Real',
    description:
      'Rastreie aberturas, cliques e resultados de cada campanha com relatórios detalhados.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: 'Agendamento de Campanhas',
    description:
      'Programe envios para o momento ideal e maximize a taxa de abertura dos seus releases.',
  },
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const NETWORK_STYLE = {
    '--net-edge': 'rgb(255 255 255 / 0.28)',
    '--net-dot-outer': 'rgb(255 255 255 / 0.65)',
    '--net-dot-core': 'rgb(255 255 255 / 0.95)',
    '--net-travel': 'rgb(255 255 255 / 0.92)',
  } as CSSProperties

  return (
    <div className="flex min-h-screen">
      {/* ── Painel esquerdo (brand) ── */}
      <div className="relative flex-col hidden gap-6 p-12 overflow-hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-900">
        {/* Rede animada como fundo decorativo */}
        <div className="absolute inset-0 opacity-40" style={NETWORK_STYLE}>
          <NetworkBackground />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 inline-flex items-center"
          aria-label="Voltar ao início"
        >
          <Image
            src="/logo.png"
            alt="AngoPress"
            width={240}
            height={64}
            className="object-contain w-auto"
            style={{ height: '5rem' }}
            priority
          />
        </Link>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-8">
          {/* Headline */}
          <div className="mb-10 space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/70">
              <span className="w-4 h-px bg-white/40" />
              Plataforma nº 1 em Angola
            </p>
            <h2 className="font-display text-4xl font-extrabold text-white leading-[1.15] tracking-tight">
              Conecte a sua marca
              <br />
              <span className="text-brand-300">aos jornalistas certos</span>
            </h2>
            <p className="max-w-md mb-10 text-base leading-relaxed text-white/75">
              Crie, segmente e envie press releases para toda a imprensa angolana. Rastreie
              resultados em tempo real.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border rounded-xl bg-white/10 border-white/15 text-brand-200">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white font-display">{f.title}</p>
                  <p className="text-xs text-white/65 leading-relaxed mt-0.5">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 flex items-center justify-between mt-auto">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} AngoPress. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <Link href="/termos" className="transition-colors hover:text-white/80">
              Termos
            </Link>
            <Link href="/privacidade" className="transition-colors hover:text-white/80">
              Privacidade
            </Link>
          </div>
        </div>
      </div>

      {/* ── Painel direito (formulário) ── */}
      <div className="flex flex-col items-center justify-center flex-1 p-6 sm:p-12 bg-neutral-50">
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-flex items-center" aria-label="Voltar ao início">
            <Image
              src="/logo.png"
              alt="AngoPress"
              width={210}
              height={56}
              className="object-contain w-auto h-10"
              priority
            />
          </Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
