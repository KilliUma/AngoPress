import Image from 'next/image'
import Link from 'next/link'
import { SectionLabel } from './ui'
import AnimateIn from '@/components/AnimateIn'
import type { NewsContent } from '@/lib/cms'
import { NEWS_FALLBACK } from '@/lib/cms'

interface Props {
  content?: NewsContent
}

const ACCENT_CLS: Record<string, { badge: string; bar: string }> = {
  brand: { badge: 'text-brand-700 bg-brand-50 border-brand-200', bar: 'bg-brand-500' },
  blue: { badge: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
  violet: { badge: 'text-violet-700 bg-violet-50 border-violet-200', bar: 'bg-violet-500' },
  emerald: {
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-500',
  },
  amber: { badge: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-500' },
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

export function NewsSection({ content }: Props) {
  const cms = content ?? NEWS_FALLBACK
  return (
    <section id="noticias" className="relative py-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 reveal">
          <div>
            <SectionLabel>{cms.sectionLabel}</SectionLabel>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mt-3">{cms.title}</h2>
            <p className="text-gray-500 mt-3 text-base max-w-xl">{cms.description}</p>
          </div>
          <Link
            href="/noticias"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-200"
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
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {cms.articles.map(({ slug, category, title, imageUrl, publishedAt, accent, url }, i) => {
            const { badge, bar } = ACCENT_CLS[accent] ?? ACCENT_CLS.brand
            const href = slug ? `/noticias/${slug}` : url || '#'
            const isExternal = !slug && !!url
            const date = formatDate(publishedAt)

            return (
              <AnimateIn key={i} variant="up" delay={i * 100}>
                <Link
                  href={href}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group block h-full"
                >
                  <article className="bg-white border border-gray-100 group-hover:border-brand-200 group-hover:shadow-md rounded-2xl overflow-hidden card-hover h-full flex flex-col transition-all duration-300">
                    {/* Imagem de destaque */}
                    <div className="relative w-full h-52 overflow-hidden bg-gray-100 flex-shrink-0">
                      {imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-300"
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
                      {/* Barra de acento no topo */}
                      <div className={`absolute top-0 inset-x-0 h-0.5 ${bar}`} />
                      {/* Badge de categoria sobreposta */}
                      <span
                        className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1 backdrop-blur-sm ${badge}`}
                      >
                        {category}
                      </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 text-base leading-snug mb-3 flex-1 transition-colors duration-200 line-clamp-3">
                        {title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        {date ? (
                          <span className="text-xs text-gray-400 flex items-center gap-1.5">
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
                        <span className="text-xs font-semibold text-brand-600/70 group-hover:text-brand-600 transition-colors duration-200 flex items-center gap-1">
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
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
