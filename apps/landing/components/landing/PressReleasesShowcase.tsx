import type { CSSProperties } from 'react'
import { SectionLabel } from './ui'
import AnimateIn from '@/components/AnimateIn'
import { NetworkBackground } from './NetworkBackground'
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
      <article className="group bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/30 rounded-2xl p-6 flex flex-col h-full transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[10px] font-bold text-white/80 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Press Release
          </span>
          {pr.publishedAt && (
            <span className="text-[10px] text-white/45">{timeAgo(pr.publishedAt)}</span>
          )}
        </div>

        <h3 className="font-bold text-white group-hover:text-white/90 text-base mb-2.5 leading-snug flex-1 transition-colors duration-200">
          {pr.title}
        </h3>
        {pr.summary && (
          <p className="text-sm text-white/65 leading-relaxed mb-5 line-clamp-3">{pr.summary}</p>
        )}

        <div className="flex items-center gap-2.5 pt-4 border-t border-white/15 mt-auto">
          <div className="w-7 h-7 rounded-lg bg-white/20 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {(pr.user.company ?? pr.user.name).charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-medium text-white/55 truncate">
            {pr.user.company ?? pr.user.name}
          </p>
        </div>
      </article>
    </AnimateIn>
  )
}

export function PressReleasesShowcase({ featured }: { featured: FeaturedPressRelease[] }) {
  const items = featured.slice(0, 3)

  const NETWORK_STYLE = {
    '--net-edge': 'rgb(255 255 255 / 0.22)',
    '--net-dot-outer': 'rgb(255 255 255 / 0.55)',
    '--net-dot-core': 'rgb(255 255 255 / 0.88)',
    '--net-travel': 'rgb(255 255 255 / 0.85)',
    '--net-avatar': 'rgb(255 255 255 / 0.88)',
  } as CSSProperties

  return (
    <section className="relative py-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
      <div className="absolute inset-0 opacity-35" style={NETWORK_STYLE}>
        <NetworkBackground />
      </div>
      <div className="absolute inset-0 grid-bg opacity-8 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 reveal">
          <div>
            <SectionLabel className="text-white/70 border-white/30 bg-white/10">
              Vitrine pública
            </SectionLabel>
            <h2 className="text-4xl font-black text-white tracking-tight mt-3">
              Press Releases em destaque
            </h2>
          </div>
          <a
            href="/press-releases"
            className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1.5 flex-shrink-0 transition-colors duration-150"
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
          <div className="rounded-2xl border border-white/15 bg-white/10 p-8 text-center">
            <p className="text-white font-semibold">Ainda não há press releases públicos.</p>
            <p className="text-white/60 text-sm mt-2">
              Assim que forem publicados, vão aparecer aqui automaticamente.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
