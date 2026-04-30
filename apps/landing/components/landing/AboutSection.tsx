import { SectionLabel } from './ui'
import type { HeroStats } from './HeroSection'
import type { AboutContent } from '@/lib/cms'
import { ABOUT_FALLBACK } from '@/lib/cms'

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k+`
  return `${n}+`
}

interface Props {
  stats?: HeroStats
  content?: AboutContent
}

// Ícones SVG mantidos em código (são UI, não conteúdo)
const PILLAR_ICONS: Record<string, string> = {
  brand:
    'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
  violet:
    'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z',
  emerald:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  amber:
    'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
}

const ACCENT: Record<string, { icon: string; ring: string; dot: string }> = {
  brand: {
    icon: 'text-brand-400',
    ring: 'bg-brand-400/10 border-brand-400/20',
    dot: 'bg-brand-400',
  },
  violet: {
    icon: 'text-violet-400',
    ring: 'bg-violet-400/10 border-violet-400/20',
    dot: 'bg-violet-400',
  },
  emerald: {
    icon: 'text-emerald-400',
    ring: 'bg-emerald-400/10 border-emerald-400/20',
    dot: 'bg-emerald-400',
  },
  amber: {
    icon: 'text-amber-400',
    ring: 'bg-amber-400/10 border-amber-400/20',
    dot: 'bg-amber-400',
  },
}

export function AboutSection({ stats, content }: Props) {
  const cms = content ?? ABOUT_FALLBACK
  const pillars = cms.pillars.length ? cms.pillars : ABOUT_FALLBACK.pillars
  return (
    <section id="sobre" className="relative py-28 px-4 sm:px-6 overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-[rgb(var(--surface-1))]" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — content + stats */}
          <div className="reveal">
            <SectionLabel>{cms.sectionLabel}</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mt-3 mb-5">
              {cms.title}
            </h2>
            <div className="space-y-4 text-base text-white/45 leading-relaxed mb-10">
              <p dangerouslySetInnerHTML={{ __html: cms.paragraph1 }} />
              <p dangerouslySetInnerHTML={{ __html: cms.paragraph2 }} />
              <p dangerouslySetInnerHTML={{ __html: cms.paragraph3 }} />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: stats ? fmtNum(stats.totalJournalists) : '2.500+',
                  label: 'Jornalistas na base',
                },
                {
                  value: stats ? fmtNum(stats.activeCompanies) : '150+',
                  label: 'Empresas activas',
                },
                {
                  value: stats ? fmtNum(stats.totalCampaignsSent) : '1.2k+',
                  label: 'Campanhas enviadas',
                },
              ].map(({ value, label }, i) => (
                <div
                  key={label}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <p className="text-2xl font-black text-white tabular-nums">{value}</p>
                  <p className="text-xs text-white/35 font-medium leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pillars */}
          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map(({ title, description, accent }, i) => {
              const { icon: iconCls, ring, dot } = ACCENT[accent] ?? ACCENT['brand']
              const iconPath = PILLAR_ICONS[accent] ?? PILLAR_ICONS['brand']
              return (
                <div
                  key={i}
                  className="reveal card-hover bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${ring}`}
                  >
                    <svg
                      className={`w-5 h-5 ${iconCls}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <h3 className="font-bold text-white text-sm">{title}</h3>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
