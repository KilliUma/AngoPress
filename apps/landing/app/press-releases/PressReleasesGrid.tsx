'use client'

import { useState } from 'react'
import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'

interface PublicPressRelease {
  id: string
  title: string
  summary: string | null
  publishedAt: string | null
  user: {
    name: string | null
    company: string | null
  } | null
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

function PressReleaseCard({
  pressRelease,
  onTitleClick,
}: {
  pressRelease: PublicPressRelease
  onTitleClick: () => void
}) {
  const date = formatDate(pressRelease.publishedAt)
  const author = pressRelease.user?.name?.trim() || 'Equipa AngoPress'
  const company = pressRelease.user?.company?.trim() || 'AngoPress'

  return (
    <article className="h-full rounded-2xl border border-neutral-200 bg-white p-5 transition-colors duration-300 hover:border-neutral-300 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <span className="inline-flex items-center rounded-full border border-brand-400/25 bg-brand-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-300">
          Press Release
        </span>
        {date ? (
          <span className="text-xs text-neutral-500">{date}</span>
        ) : (
          <span className="text-xs text-neutral-400">Sem data</span>
        )}
      </div>

      <button
        type="button"
        onClick={onTitleClick}
        className="mb-3 line-clamp-3 text-base font-bold leading-snug text-neutral-900 text-left w-full hover:text-brand-700 hover:underline decoration-brand-400/50 underline-offset-2 cursor-pointer transition-colors duration-200"
      >
        {pressRelease.title}
      </button>

      <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-neutral-600">
        {pressRelease.summary?.trim() || 'Comunicado publicado na plataforma AngoPress.'}
      </p>

      <div className="mt-auto border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <p className="font-medium text-neutral-700">{author}</p>
        <p>{company}</p>
      </div>
    </article>
  )
}

export function PressReleasesGrid({ items }: { items: PublicPressRelease[] }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pressRelease) => (
          <PressReleaseCard
            key={pressRelease.id}
            pressRelease={pressRelease}
            onTitleClick={() => setModalOpen(true)}
          />
        ))}
      </div>

      <JournalistRegisterModal
        variant="footer"
        externalOpen={modalOpen}
        onExternalClose={() => setModalOpen(false)}
      />
    </>
  )
}
