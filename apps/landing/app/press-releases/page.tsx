import Link from 'next/link'
import type { CSSProperties } from 'react'
import { NetworkBackground } from '@/components/landing/NetworkBackground'
import { PressReleasesGrid } from './PressReleasesGrid'

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

function resolveApiBaseUrls(): string[] {
  const urls: string[] = []

  const apiUrl = process.env.API_URL?.trim()
  if (apiUrl) urls.push(apiUrl.replace(/\/$/, ''))

  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    try {
      urls.push(new URL(appUrl).origin)
    } catch {
      // Ignora APP_URL inválido e segue para fallback.
    }
  }

  urls.push('http://localhost:3000', 'http://localhost:3001', 'https://angopress.vercel.app')
  return [...new Set(urls)]
}

async function fetchPublicPressReleases(
  page: number,
  limit = 12,
): Promise<PublicPressReleasesResponse> {
  const bases = resolveApiBaseUrls()

  // Endpoints em ordem de preferência
  const endpoints = [
    // API backend (NestJS)
    { path: `/api/v1/press-releases/public?page=${page}&limit=${limit}`, label: 'NestJS v1' },
    { path: `/api/press-releases/public?page=${page}&limit=${limit}`, label: 'NestJS default' },
    // Next.js middleware/route handlers em apps/web
    { path: `/api/press-releases/public?page=${page}&limit=${limit}`, label: 'Next.js route' },
    // Fallback: pega apenas os destacados (6 primeiros)
    { path: `/api/press-releases/public/featured`, label: 'Featured fallback', isFeatured: true },
  ]

  let firstEmpty: PublicPressReleasesResponse | null = null

  for (const base of bases) {
    for (const endpoint of endpoints) {
      try {
        const url = `${base}${endpoint.path}`
        const res = await fetch(url, {
          cache: endpoint.isFeatured ? 'force-cache' : 'force-cache',
          next: { revalidate: endpoint.isFeatured ? 300 : 180 },
        })

        if (!res.ok) {
          console.warn(
            `[Press Releases] Endpoint ${endpoint.label} (${base}) failed with status ${res.status}`,
          )
          continue
        }

        const json = (await res.json()) as any

        // Se é resposta de featured (array direto), converte para formato esperado
        if (endpoint.isFeatured && Array.isArray(json)) {
          const converted = {
            data: json.slice(0, limit),
            meta: {
              total: json.length,
              page: 1,
              limit,
              totalPages: 1,
            },
          }
          if (converted.data.length > 0) return converted
          if (!firstEmpty) firstEmpty = converted
          continue
        }

        // Se é resposta padrão com data/meta
        if (Array.isArray(json.data) && json.meta) {
          if (json.data.length > 0) {
            console.log(
              `[Press Releases] Loaded from ${endpoint.label} (${base}): ${json.data.length} items`,
            )
            return json
          }
          if (!firstEmpty) firstEmpty = json
          continue
        }

        console.warn(`[Press Releases] ${endpoint.label} (${base}) returned invalid format`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.warn(`[Press Releases] ${endpoint.label} (${base}) error: ${errorMsg}`)
        continue
      }
    }
  }

  if (firstEmpty) return firstEmpty

  // Se nenhum endpoint funcionou, retorna vazio (será mostrado mensagem de "nenhum publicado")
  console.warn('[Press Releases] All endpoints failed. No press releases available.')
  return {
    data: [],
    meta: { total: 0, page, limit, totalPages: 1 },
  }
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

        <div className="absolute inset-x-0 top-[110px] px-4 sm:px-6">
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
          <PressReleasesGrid items={data} />
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
