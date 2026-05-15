'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { SectionLabel } from './ui'
import AnimateIn from '@/components/AnimateIn'
import { NetworkBackground } from './NetworkBackground'
import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'
import type { FeaturedPressRelease } from './types'

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function PRCard({
  pr,
  index,
  onTitleClick,
}: {
  pr: FeaturedPressRelease
  index: number
  onTitleClick: () => void
}) {
  return (
    <AnimateIn variant="up" delay={index * 100}>
      <article className="flex flex-col h-full p-6 transition-all duration-300 border group bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/30 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-[10px] font-bold text-white/80 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Press Release
          </span>
          {pr.publishedAt && (
            <span className="text-[10px] text-white/45">{timeAgo(pr.publishedAt)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onTitleClick}
          className="font-bold text-white group-hover:text-white/90 text-base mb-2.5 leading-snug flex-1 transition-colors duration-200 text-left hover:underline decoration-white/40 underline-offset-2 cursor-pointer"
        >
          {pr.title}
        </button>
        {pr.summary && (
          <p className="mb-5 text-sm leading-relaxed text-white/65 line-clamp-3">{pr.summary}</p>
        )}

        <div className="flex items-center gap-2.5 pt-4 border-t border-white/15 mt-auto">
          <div className="flex items-center justify-center flex-shrink-0 text-xs font-bold text-white rounded-lg w-7 h-7 bg-white/20">
            {(pr.user.company ?? pr.user.name).charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-medium truncate text-white/55">
            {pr.user.company ?? pr.user.name}
          </p>
        </div>
      </article>
    </AnimateIn>
  )
}

export function PressReleasesShowcase({ featured }: { featured: FeaturedPressRelease[] }) {
  const items = featured.slice(0, 3)
  const [modalOpen, setModalOpen] = useState(false)

  const NETWORK_STYLE = {
    '--net-edge': 'rgb(255 255 255 / 0.22)',
    '--net-dot-outer': 'rgb(255 255 255 / 0.55)',
    '--net-dot-core': 'rgb(255 255 255 / 0.88)',
    '--net-travel': 'rgb(255 255 255 / 0.85)',
    '--net-avatar': 'rgb(255 255 255 / 0.88)',
  } as CSSProperties

  return (
    <section className="relative px-4 overflow-hidden py-28 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
      <div className="absolute inset-0 opacity-35" style={NETWORK_STYLE}>
        <NetworkBackground />
      </div>
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-8" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-12 sm:flex-row sm:items-end sm:justify-between reveal">
          <div>
            <SectionLabel className="text-white/70 border-white/30 bg-white/10">
              Vitrine pública
            </SectionLabel>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
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
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((pr, i) => (
              <PRCard key={pr.id} pr={pr} index={i} onTitleClick={() => setModalOpen(true)} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border rounded-2xl border-white/15 bg-white/10">
            <p className="font-semibold text-white">Ainda não há press releases públicos.</p>
            <p className="mt-2 text-sm text-white/60">
              Assim que forem publicados, vão aparecer aqui automaticamente.
            </p>
          </div>
        )}

        {/* Modal de registo de jornalista — disparado pelos títulos dos cards */}
        <JournalistRegisterModal
          variant="footer"
          externalOpen={modalOpen}
          onExternalClose={() => setModalOpen(false)}
        />
      </div>
    </section>
  )
}
