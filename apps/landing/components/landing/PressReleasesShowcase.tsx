import { SectionLabel } from './ui'
import AnimateIn from '@/components/AnimateIn'
import type { FeaturedPressRelease } from './types'

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function PRCard({ pr, index }: { pr: FeaturedPressRelease; index: number }) {
  return (
    <AnimateIn variant="up" delay={index * 100}>
      <article className="group bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-6 flex flex-col h-full card-hover transition-all duration-300">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[10px] font-bold text-brand-400 bg-brand-400/10 border border-brand-400/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Press Release
          </span>
          {pr.publishedAt && (
            <span className="text-[10px] text-white/25">{timeAgo(pr.publishedAt)}</span>
          )}
        </div>

        <h3 className="font-bold text-white/80 group-hover:text-white text-base mb-2.5 leading-snug flex-1 transition-colors duration-200">
          {pr.title}
        </h3>
        {pr.summary && (
          <p className="text-sm text-white/35 leading-relaxed mb-5 line-clamp-3">{pr.summary}</p>
        )}

        <div className="flex items-center gap-2.5 pt-4 border-t border-white/[0.05] mt-auto">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {(pr.user.company ?? pr.user.name).charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-medium text-white/35 truncate">
            {pr.user.company ?? pr.user.name}
          </p>
        </div>
      </article>
    </AnimateIn>
  )
}

export function PressReleasesShowcase({ featured }: { featured: FeaturedPressRelease[] }) {
  const items = featured.slice(0, 3)

  return (
    <section className="relative py-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[rgb(var(--surface))]" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 reveal">
          <div>
            <SectionLabel>Vitrine pública</SectionLabel>
            <h2 className="text-4xl font-black text-white tracking-tight mt-3">
              Press Releases em destaque
            </h2>
          </div>
          <a
            href="/press-releases"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 flex-shrink-0 transition-colors duration-150"
          >
            Ver todos
            <svg
              className="w-4 h-4"
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
        </div>

        {items.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-5">
            {items.map((pr, i) => (
              <PRCard key={pr.id} pr={pr} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
            <p className="text-white/70 font-semibold">Ainda não há press releases públicos.</p>
            <p className="text-white/40 text-sm mt-2">
              Assim que forem publicados, vão aparecer aqui automaticamente.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
