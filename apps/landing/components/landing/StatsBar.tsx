import type { HeroStats } from './HeroSection'

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k+`
  return `${n}+`
}

interface Props {
  stats?: HeroStats
}

export function StatsBar({ stats }: Props) {
  const STATS = [
    { value: stats ? fmtNum(stats.totalJournalists) : '2.500+', label: 'Jornalistas na base' },
    { value: stats ? fmtNum(stats.activeCompanies) : '150+', label: 'Empresas activas' },
    { value: stats ? fmtNum(stats.totalCampaignsSent) : '1.2k+', label: 'Campanhas enviadas' },
    { value: '18', label: 'Províncias cobertas' },
  ]

  return (
    <section className="relative py-12 px-4 sm:px-6 bg-gray-50 border-y border-gray-100">
      <div className="relative max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className="reveal flex flex-col items-center py-6 px-4 gap-2 text-center"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-4xl sm:text-5xl font-black text-brand-600 leading-none tabular-nums">
                {value}
              </p>
              <p className="text-xs text-gray-500 font-medium leading-snug max-w-[100px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
