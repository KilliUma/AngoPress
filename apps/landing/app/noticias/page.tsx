import Image from 'next/image'
import Link from 'next/link'
import { getAllNews } from '@/lib/cms'
import type { NewsArticle } from '@/lib/cms'

export const metadata = {
  title: 'Notícias | AngoPress',
  description:
    'Últimas notícias da AngoPress — novidades da plataforma, tendências do sector e dicas para uma comunicação mais eficaz.',
}

const ACCENT_CLS: Record<string, { badge: string; bar: string }> = {
  brand: { badge: 'text-brand-400 bg-brand-400/15 border-brand-400/25', bar: 'bg-brand-500' },
  blue: { badge: 'text-blue-400 bg-blue-400/15 border-blue-400/25', bar: 'bg-blue-500' },
  violet: { badge: 'text-violet-400 bg-violet-400/15 border-violet-400/25', bar: 'bg-violet-500' },
  emerald: {
    badge: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/25',
    bar: 'bg-emerald-500',
  },
  amber: { badge: 'text-amber-400 bg-amber-400/15 border-amber-400/25', bar: 'bg-amber-500' },
}

function formatDate(iso: string) {
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

function ArticleCard({ article }: { article: NewsArticle }) {
  const { badge, bar } = ACCENT_CLS[article.accent] ?? ACCENT_CLS.brand
  const date = formatDate(article.publishedAt)
  const href = article.slug ? `/noticias/${article.slug}` : article.url || '#'
  const isExternal = !article.slug && !!article.url

  return (
    <Link
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block h-full"
    >
      <article className="bg-white/[0.03] border border-white/[0.07] group-hover:border-white/[0.15] rounded-2xl overflow-hidden h-full flex flex-col transition-colors duration-300">
        {/* Imagem */}
        <div className="relative w-full h-48 overflow-hidden bg-white/[0.04] flex-shrink-0">
          {article.imageUrl ? (
            <>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white/10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          )}
          <div className={`absolute top-0 inset-x-0 h-0.5 ${bar}`} />
          {article.category && (
            <span
              className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1 backdrop-blur-sm ${badge}`}
            >
              {article.category}
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex flex-col flex-1">
          <h2 className="font-bold text-white/80 group-hover:text-white text-base leading-snug mb-3 flex-1 transition-colors duration-200 line-clamp-3">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-sm text-white/35 leading-relaxed mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
            {date ? (
              <span className="text-xs text-white/25 flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                {date}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs font-semibold text-brand-400/60 group-hover:text-brand-400 transition-colors duration-200 flex items-center gap-1">
              Ler
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200"
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
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function NoticiasPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const { articles, total, totalPages } = await getAllNews(page, 12)

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-0))] text-white">
      {/* ───── HERO ───── */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden">
        {/* Fundo: gradiente de marca + grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-[rgb(var(--surface-1))] to-[rgb(var(--surface-0))]" />
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        {/* Gradiente base: escurece o rodapé */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--surface-0))] via-black/40 to-transparent" />

        {/* Overlay do topo: contraste para a breadcrumb */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 inset-x-0 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-1.5 text-xs text-white/70">
              <Link href="/" className="hover:text-white transition-colors">
                Início
              </Link>
              <svg
                className="w-3 h-3 opacity-50 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-white/50">Notícias</span>
            </nav>
          </div>
        </div>

        {/* Título no rodapé do hero */}
        <div className="absolute bottom-0 inset-x-0 pb-7 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest border rounded-full px-3 py-1 mb-3 bg-brand-500/20 text-brand-300 border-brand-500/30">
              Notícias
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
              Últimas Notícias
            </h1>
            <p className="text-sm text-white/45">
              {total > 0
                ? `${total} artigo${total !== 1 ? 's' : ''} publicado${total !== 1 ? 's' : ''}`
                : 'Sem artigos publicados ainda.'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <ArticleCard key={article.slug || article.title} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-white/30">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
              />
            </svg>
            <p className="text-lg font-medium">Nenhum artigo publicado ainda.</p>
            <p className="text-sm mt-1">Volte mais tarde para ver as novidades da AngoPress.</p>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/noticias?page=${page - 1}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm text-white/60 hover:text-white transition-all"
              >
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
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
                Anterior
              </Link>
            )}
            <span className="text-sm text-white/30 px-2">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/noticias?page=${page + 1}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm text-white/60 hover:text-white transition-all"
              >
                Próxima
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
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
