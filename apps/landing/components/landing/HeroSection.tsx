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
      <div className="absolute -inset-8 bg-gradient-radial from-brand-600/20 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div
        className="relative border border-white/[0.08] rounded-2xl overflow-hidden animate-scale-in shadow-2xl shadow-black/60"
        style={{ animationDelay: '0.5s', background: 'rgb(var(--surface-1))' }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 flex justify-center">
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
                <p className="text-xl font-black text-white leading-none mb-1">{value}</p>
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
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  <p className="text-xs text-white/70 font-medium truncate">{title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173'
  const journalistsLabel = stats ? fmtNum(stats.totalJournalists) + '+' : '2.500+'
  const cms = content ?? HERO_FALLBACK
  // Se o URL já for absoluto usa directamente; caso contrário prefixar com APP_URL
  const primaryHref = cms.ctaPrimaryUrl.startsWith('http')
    ? cms.ctaPrimaryUrl
    : `${APP_URL}${cms.ctaPrimaryUrl}`

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-16 px-4 sm:px-6">
      {/* Base background */}
      <div className="absolute inset-0 bg-[rgb(var(--surface))]" />

      {/* Animated network of connections */}
      <NetworkBackground />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none" />

      {/* Radial spotlight — top centre */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-brand-800/18 via-brand-900/6 to-transparent" />
      </div>

      {/* Soft vignette — bottom */}
      <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-[rgb(var(--surface))] to-transparent pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="order-2 lg:order-1">
            {/* Status badge */}
            <div className="animate-fade-up" style={{ animationDelay: '0s' }}>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-gray-600 bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping2 absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                {cms.badge}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-[3.5rem] sm:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.04] tracking-tight mb-6 animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="text-gray-900">{cms.headlineLine1}</span>
              <br />
              <span className="text-gradient">{cms.headlineLine2}</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-[1.0625rem] text-gray-500 max-w-[480px] mb-10 leading-[1.7] animate-fade-up"
              style={{ animationDelay: '0.18s' }}
            >
              {cms.subtitle}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 mb-14 animate-fade-up"
              style={{ animationDelay: '0.26s' }}
            >
              <a
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-brand-700/30 ring-1 ring-brand-400/15 hover:ring-brand-400/30"
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
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-150"
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
              <p className="text-xs text-gray-500 leading-snug">
                <span className="text-gray-900 font-semibold">{journalistsLabel}</span> jornalistas
                já na plataforma
              </p>
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="order-1 lg:order-2 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <DashboardMockup stats={stats} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 divider-glow" />
    </section>
  )
}
