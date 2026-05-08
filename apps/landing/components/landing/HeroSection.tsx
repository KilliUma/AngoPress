import type { CSSProperties } from 'react'
import { NetworkBackground } from './NetworkBackground'
import type { HeroContent } from '@/lib/cms'
import { HERO_FALLBACK } from '@/lib/cms'

export interface HeroStats {
  totalJournalists: number
  totalCampaignsSent: number
  activeCompanies: number
  journalistInitials?: string[]
}

interface Props {
  stats?: HeroStats
  content?: HeroContent
}

const HERO_NETWORK_STYLE = {
  '--net-edge': 'rgb(255 255 255 / 0.28)',
  '--net-dot-outer': 'rgb(255 255 255 / 0.65)',
  '--net-dot-core': 'rgb(255 255 255 / 0.95)',
  '--net-travel': 'rgb(255 255 255 / 0.92)',
  '--net-avatar': 'rgb(255 255 255 / 0.92)',
} as CSSProperties

const DASHBOARD_ROWS = [
  {
    title: 'Lançamento Produto Alpha',
    time: '2h atrás',
    status: 'ENVIADO',
    dot: 'bg-emerald-400',
    cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    title: 'Nota à Imprensa Q1 2026',
    time: '1d atrás',
    status: 'AGENDADO',
    dot: 'bg-blue-400',
    cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  },
  {
    title: 'Comunicado de Parceria',
    time: '2d atrás',
    status: 'RASCUNHO',
    dot: 'bg-white/30',
    cls: 'text-white/40 bg-white/5 border-white/10',
  },
]

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function DashboardMockup({ stats }: { stats?: HeroStats }) {
  const journalists = stats ? fmtNum(stats.totalJournalists) : '2.500+'
  const campaigns = stats ? fmtNum(stats.totalCampaignsSent) : '1.2k'
  const companies = stats ? fmtNum(stats.activeCompanies) : '150+'

  const dashStats = [
    { label: 'Campanhas enviadas', value: campaigns, delta: 'total', color: 'text-emerald-400' },
    { label: 'Taxa de entrega', value: '98%', delta: 'média', color: 'text-blue-400' },
    {
      label: 'Jornalistas activos',
      value: journalists,
      delta: 'na base',
      color: 'text-violet-400',
    },
  ]

  return (
    <div className="relative">
      <div className="absolute rounded-full pointer-events-none -inset-8 bg-gradient-radial from-brand-600/20 to-transparent blur-3xl" />
      <div
        className="relative border border-white/[0.08] rounded-2xl overflow-hidden animate-scale-in shadow-2xl shadow-black/60"
        style={{ animationDelay: '0.5s', background: 'rgb(13, 13, 20)' }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex justify-center flex-1">
            <span className="text-[11px] text-white/25 font-mono bg-white/5 px-3 py-0.5 rounded border border-white/[0.06]">
              app.angopress.ao — Dashboard
            </span>
          </div>
          <span className="text-[10px] text-white/20 font-medium hidden sm:block">
            {companies} empresas
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {dashStats.map(({ label, value, delta, color }, i) => (
              <div
                key={label}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 animate-fade-up"
                style={{ animationDelay: `${0.7 + i * 0.08}s` }}
              >
                <p className="text-[10px] text-white/35 mb-1.5 font-medium">{label}</p>
                <p className="mb-1 text-xl font-black leading-none text-white">{value}</p>
                <p className={`text-[10px] font-semibold ${color}`}>{delta}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest mb-2 px-0.5">
            Recentes
          </p>
          <div className="space-y-1.5">
            {DASHBOARD_ROWS.map(({ title, time, status, dot, cls }, i) => (
              <div
                key={title}
                className="flex items-center justify-between bg-white/[0.025] border border-white/[0.05] rounded-lg px-3 py-2 gap-3 animate-fade-up"
                style={{ animationDelay: `${0.95 + i * 0.08}s` }}
              >
                <div className="flex items-center min-w-0 gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  <p className="text-xs font-medium truncate text-white/70">{title}</p>
                </div>
                <div className="flex items-center flex-shrink-0 gap-2">
                  <span className="text-[10px] text-white/25">{time}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSection({ stats, content }: Props) {
  const journalistsLabel = stats ? fmtNum(stats.totalJournalists) + '+' : '2.500+'
  const cms = content ?? HERO_FALLBACK
  const primaryHref = 'https://angopress.vercel.app/login'

  return (
    <section className="relative flex flex-col justify-center min-h-screen px-4 pt-20 pb-16 overflow-hidden sm:px-6">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />

      {/* Animated network of connections */}
      <div className="absolute inset-0 opacity-50" style={HERO_NETWORK_STYLE}>
        <NetworkBackground />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-10" />

      {/* Radial spotlight — top centre */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-brand-800/18 via-brand-900/6 to-transparent" />
      </div>

      {/* Soft vignette — bottom */}
      <div className="absolute inset-x-0 bottom-0 h-56 pointer-events-none bg-gradient-to-t from-brand-950/80 to-transparent" />

      {/* ── Content ── */}
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid items-center gap-16 lg:grid-cols-2 justify-items-center lg:justify-items-stretch">
          {/* Left */}
          <div className="flex flex-col items-center order-2 text-center lg:order-1 lg:items-start lg:text-left">
            {/* Status badge */}
            <div className="animate-fade-up" style={{ animationDelay: '0s' }}>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/80 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping2 bg-emerald-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                {cms.badge}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.04] tracking-tight mb-6 animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="text-white">{cms.headlineLine1}</span>
              <br />
              <span className="text-gradient-gold">{cms.headlineLine2}</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-[1.0625rem] text-white/70 max-w-[480px] mb-10 leading-[1.7] animate-fade-up"
              style={{ animationDelay: '0.18s' }}
            >
              {cms.subtitle}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col gap-3 sm:flex-row mb-14 animate-fade-up"
              style={{ animationDelay: '0.26s' }}
            >
              <a
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold bg-white hover:bg-white/90 text-brand-700 rounded-xl transition-all duration-200 shadow-lg shadow-black/30"
              >
                {cms.ctaPrimaryLabel}
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
              <a
                href={cms.ctaSecondaryUrl}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white/80 hover:text-white border border-white/25 hover:border-white/40 hover:bg-white/10 rounded-xl transition-all duration-150"
              >
                <svg
                  className="w-4 h-4 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
                  />
                </svg>
                {cms.ctaSecondaryLabel}
              </a>
            </div>

            {/* Social proof — real journalist count + initials */}
            <div
              className="flex items-center gap-3.5 animate-fade-up"
              style={{ animationDelay: '0.34s' }}
            >
              <div className="flex -space-x-2">
                {(stats?.journalistInitials?.length
                  ? stats.journalistInitials
                  : ['J', 'A', 'M', 'T', 'R']
                )
                  .slice(0, 5)
                  .map((l, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-[10px] font-bold text-white"
                    >
                      {l}
                    </div>
                  ))}
              </div>
              <p className="text-xs leading-snug text-white/70">
                <span className="font-semibold text-white">{journalistsLabel}</span> jornalistas já
                na plataforma
              </p>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div
            className="order-1 lg:order-2 animate-fade-up max-lg:!hidden"
            style={{ animationDelay: '0.4s' }}
          >
            <DashboardMockup stats={stats} />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 divider-glow" />
    </section>
  )
}
