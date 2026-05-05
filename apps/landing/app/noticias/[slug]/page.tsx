import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getNewsArticle } from '@/lib/cms'
import type { NewsArticlePreview } from '@/lib/cms'

interface Props {
  params: Promise<{ slug: string }>
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function formatDate(iso: string, short = false) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: short ? 'short' : 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

const ACCENT_BADGE: Record<string, string> = {
  brand: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

// ──────────────────────────────────────────────────────────────
// Ícones SVG inline
// ──────────────────────────────────────────────────────────────
function IconChevron() {
  return (
    <svg
      className="w-3 h-3 opacity-50 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function IconArrowLeft({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function IconArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg
      className="w-3.5 h-3.5"
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
  )
}

// ──────────────────────────────────────────────────────────────
// Botões de partilha social
// ──────────────────────────────────────────────────────────────
interface ShareProps {
  url: string
  title: string
  compact?: boolean
}

function ShareButtons({ url, title, compact = false }: ShareProps) {
  const encoded = encodeURIComponent(url)
  const encTitle = encodeURIComponent(title)

  const buttons = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
      ),
    },
    {
      label: 'X / Twitter',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encTitle}`,
      color: 'bg-black hover:bg-neutral-800 border border-white/20',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      color: 'bg-[#0A66C2] hover:bg-[#084d93]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'bg-[#25D366] hover:bg-[#1db954]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      ),
    },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {buttons.map((b) => (
          <a
            key={b.label}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Partilhar no ${b.label}`}
            className={`flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all duration-150 ${b.color}`}
          >
            {b.icon}
          </a>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Partilhar
      </span>
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partilhar no ${b.label}`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all duration-150 ${b.color}`}
        >
          {b.icon}
          <span className="hidden sm:inline">{b.label}</span>
        </a>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Miniatura de artigo (sidebar recentes)
// ──────────────────────────────────────────────────────────────
function ArticleThumb({ article }: { article: NewsArticlePreview }) {
  const date = formatDate(article.publishedAt, true)
  return (
    <Link
      href={`/noticias/${article.slug}`}
      className="group flex gap-3 items-start hover:opacity-80 transition-opacity"
    >
      <div className="relative w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.05]">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-900/60" />
        )}
      </div>
      <div className="min-w-0">
        {date && <p className="text-[10px] text-brand-400 font-semibold mb-0.5">{date}</p>}
        <p className="text-xs text-neutral-700 group-hover:text-neutral-900 transition-colors leading-snug line-clamp-2">
          {article.title}
        </p>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────────────────────────
// Card de artigo relacionado
// ──────────────────────────────────────────────────────────────
function RelatedCard({ article }: { article: NewsArticlePreview }) {
  const date = formatDate(article.publishedAt, true)
  return (
    <Link
      href={`/noticias/${article.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-neutral-200 bg-white hover:border-brand-300 transition-all duration-200 shadow-sm"
    >
      <div className="relative h-36 bg-neutral-100">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width:768px)100vw,33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-brand-900/40" />
        )}
        {article.category && (
          <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-brand-500/80 backdrop-blur-sm text-white rounded-full px-2.5 py-0.5">
            {article.category}
          </span>
        )}
      </div>
      <div className="p-3">
        {date && <p className="text-[10px] text-neutral-500 mb-1">{date}</p>}
        <p className="text-xs text-neutral-700 group-hover:text-neutral-900 transition-colors leading-snug line-clamp-2 font-medium">
          {article.title}
        </p>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────────────────────────
// Navegação anterior / próxima
// ──────────────────────────────────────────────────────────────
function PrevNextNav({
  prev,
  next,
}: {
  prev: NewsArticlePreview | null
  next: NewsArticlePreview | null
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={`/noticias/${prev.slug}`}
          className="group flex flex-col gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/30 transition-all duration-200"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <IconArrowLeft className="w-3.5 h-3.5" />
            Notícia anterior
          </span>
          <p className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors line-clamp-2 font-medium leading-snug">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/noticias/${next.slug}`}
          className="group flex flex-col items-end gap-2 p-4 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/30 transition-all duration-200 text-right"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Próxima notícia
            <IconArrowRight className="w-3.5 h-3.5" />
          </span>
          <p className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors line-clamp-2 font-medium leading-snug">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────────────────────
export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getNewsArticle(slug)
  if (!article) notFound()

  const badge = ACCENT_BADGE[article.accent] ?? ACCENT_BADGE.brand
  const date = formatDate(article.publishedAt)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://angopress.ao'
  const pageUrl = `${siteUrl}/noticias/${article.slug}`

  // Categorias para a sidebar
  const categoryMap = new Map<string, number>()
  if (article.category) categoryMap.set(article.category, 1)
  article.recent.forEach((a) => {
    if (a.category) categoryMap.set(a.category, (categoryMap.get(a.category) ?? 0) + 1)
  })
  article.related.forEach((a) => {
    if (a.category) categoryMap.set(a.category, (categoryMap.get(a.category) ?? 0) + 1)
  })
  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen bg-[rgb(var(--surface))] text-neutral-900">
      {/* ───── HERO ───── */}
      <div className="relative w-full h-72 sm:h-[30rem] overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-brand-950" />
        )}

        {/* Gradiente base: escurece o rodapé (para o título) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--surface))] via-black/55 to-transparent" />

        {/* Overlay do topo: garante contraste para a breadcrumb */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-4 inset-x-0 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center gap-1.5 text-xs text-white/70">
              <Link href="/" className="hover:text-white transition-colors">
                Início
              </Link>
              <IconChevron />
              <Link href="/noticias" className="hover:text-white transition-colors">
                Notícias
              </Link>
              <IconChevron />
              <span className="text-white/50 truncate max-w-[180px] sm:max-w-xs">
                {article.title}
              </span>
            </nav>
          </div>
        </div>

        {/* Título + meta no rodapé do hero */}
        <div className="absolute bottom-0 inset-x-0 pb-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {article.category && (
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-widest border rounded-full px-3 py-1 mb-3 ${badge}`}
              >
                {article.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 max-w-3xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
              {date && (
                <span className="flex items-center gap-1.5">
                  <IconCalendar />
                  {date}
                </span>
              )}
              {article.readTime && (
                <span className="flex items-center gap-1.5">
                  <IconClock />
                  {article.readTime} de leitura
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───── CONTEÚDO PRINCIPAL ───── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ── Coluna principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Barra de partilha */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-200">
              <ShareButtons url={pageUrl} title={article.title} />
            </div>

            {/* Corpo do artigo */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {article.content ? (
                <div
                  className="prose prose-base max-w-none
                    prose-p:text-neutral-700 prose-p:leading-relaxed
                    prose-headings:text-neutral-900 prose-headings:font-bold
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                    prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-neutral-900
                    prose-ul:text-neutral-700 prose-ol:text-neutral-700
                    prose-li:marker:text-brand-400
                    prose-blockquote:border-l-brand-500 prose-blockquote:text-neutral-600 prose-blockquote:not-italic
                    prose-hr:border-neutral-200
                    prose-img:rounded-xl prose-img:w-full"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : article.excerpt ? (
                <p className="text-neutral-700 text-base leading-relaxed">{article.excerpt}</p>
              ) : (
                <p className="text-neutral-500 italic text-sm">Conteúdo não disponível.</p>
              )}

              {/* Link para fonte original */}
              {article.url && (
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-colors duration-150"
                  >
                    Ler na fonte original
                    <IconArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* CTA de partilha */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
              <p className="text-sm font-semibold text-neutral-700 mb-4">
                Gostou da notícia? Partilhe!
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <ShareButtons url={pageUrl} title={article.title} compact />
              </div>
            </div>

            {/* Navegação prev / next */}
            {(article.prev || article.next) && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  Outras notícias
                </h2>
                <PrevNextNav prev={article.prev} next={article.next} />
              </div>
            )}

            {/* Artigos relacionados */}
            {article.related.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  Notícias relacionadas
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {article.related.map((r) => (
                    <RelatedCard key={r.slug} article={r} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar (1/3) */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Botão voltar */}
            <Link
              href="/noticias"
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-sm text-neutral-700 hover:text-neutral-900 font-medium transition-all duration-150"
            >
              <IconArrowLeft />
              Voltar às notícias
            </Link>

            {/* Notícias recentes */}
            {article.recent.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  Notícias recentes
                </h3>
                <ul className="space-y-4">
                  {article.recent.map((r) => (
                    <li key={r.slug}>
                      <ArticleThumb article={r} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categorias */}
            {categories.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  Categorias
                </h3>
                <ul className="space-y-1.5">
                  {categories.map(([cat, count]) => (
                    <li key={cat}>
                      <Link
                        href={`/noticias?categoria=${encodeURIComponent(cat)}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors group"
                      >
                        <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                          {cat}
                        </span>
                        <span className="text-[10px] font-bold bg-brand-500/20 text-brand-400 rounded-full px-2 py-0.5">
                          {count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}

// ──────────────────────────────────────────────────────────────
// Metadata SEO
// ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const article = await getNewsArticle(slug)
  if (!article) return { title: 'Artigo não encontrado | AngoPress' }
  return {
    title: `${article.title} | AngoPress`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  }
}
