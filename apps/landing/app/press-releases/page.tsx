import Link from 'next/link'
import type { CSSProperties } from 'react'
import { NetworkBackground } from '@/components/landing/NetworkBackground'

export const metadata = {
  title: 'Press Releases | AngoPress',
  description:
    'Todos os press releases públicos publicados na AngoPress, com actualizações e comunicados institucionais.',
}

const INTERNAL_HERO_NETWORK_STYLE = {
  '--net-edge': 'rgb(255 255 255 / 0.34)',
  '--net-dot-outer': 'rgb(255 255 255 / 0.72)',
  '--net-dot-core': 'rgb(255 255 255 / 0.98)',
  '--net-travel': 'rgb(255 255 255 / 0.95)',
  '--net-avatar': 'rgb(255 255 255 / 0.95)',
} as CSSProperties

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

interface PublicPressReleasesResponse {
  data: PublicPressRelease[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function resolveApiBaseUrl(): string {
  const apiUrl = process.env.API_URL?.trim()
  if (apiUrl) return apiUrl.replace(/\/$/, '')

  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    try {
      return new URL(appUrl).origin
    } catch {
      // Ignora APP_URL inválido e usa fallback local.
    }
  }

  return 'http://localhost:3001'
}

async function fetchPublicPressReleases(
  page: number,
  limit = 12,
): Promise<PublicPressReleasesResponse> {
  const base = resolveApiBaseUrl()
  const paths = [
    `/api/v1/press-releases/public?page=${page}&limit=${limit}`,
    `/api/press-releases/public?page=${page}&limit=${limit}`,
  ]

  for (const path of paths) {
    try {
      const res = await fetch(`${base}${path}`, {
        cache: 'force-cache',
        next: { revalidate: 180 },
      })

      if (!res.ok) continue

      const json = (await res.json()) as PublicPressReleasesResponse
      if (Array.isArray(json.data) && json.meta) return json
    } catch {
      // Tenta o próximo endpoint candidato.
    }
  }

  return {
    data: [],
    meta: { total: 0, page, limit, totalPages: 1 },
  }
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

function PressReleaseCard({ pressRelease }: { pressRelease: PublicPressRelease }) {
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

      <h2 className="mb-3 line-clamp-3 text-base font-bold leading-snug text-neutral-900">
        {pressRelease.title}
      </h2>

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

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function PressReleasesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const { data, meta } = await fetchPublicPressReleases(page, 12)

  return (
    <main className="min-h-screen bg-[rgb(var(--surface))] text-neutral-900">
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900" />
        <div className="absolute inset-0 opacity-55" style={INTERNAL_HERO_NETWORK_STYLE}>
          <NetworkBackground />
        </div>
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />

        <div className="absolute inset-x-0 top-[76px] px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <nav className="flex items-center gap-1.5 text-xs text-white/70">
              <Link href="/" className="transition-colors hover:text-white">
                Início
              </Link>
              <svg
                className="h-3 w-3 flex-shrink-0 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-white/50">Press Releases</span>
            </nav>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-4 pb-7 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <span className="mb-3 inline-block rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
              Comunicados
            </span>
            <h1 className="mb-2 text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
              Press Releases Publicados
            </h1>
            <p className="text-sm text-white/70">
              {meta.total > 0
                ? `${meta.total} press release${meta.total !== 1 ? 's' : ''} publicado${meta.total !== 1 ? 's' : ''}`
                : 'Sem press releases publicados ainda.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {data.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((pressRelease) => (
              <PressReleaseCard key={pressRelease.id} pressRelease={pressRelease} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-neutral-500">
            <svg
              className="mx-auto mb-4 h-12 w-12 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 19.5v-5.25Z"
              />
            </svg>
            <p className="text-lg font-medium text-neutral-800">
              Nenhum press release publicado ainda.
            </p>
            <p className="mt-1 text-sm">Volte mais tarde para acompanhar os novos comunicados.</p>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/press-releases?page=${page - 1}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 transition-all hover:bg-neutral-100 hover:text-neutral-900"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
                Anterior
              </Link>
            )}

            <span className="px-2 text-sm text-neutral-500">
              Página {page} de {meta.totalPages}
            </span>

            {page < meta.totalPages && (
              <Link
                href={`/press-releases?page=${page + 1}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 transition-all hover:bg-neutral-100 hover:text-neutral-900"
              >
                Próxima
                <svg
                  className="h-4 w-4"
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
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
