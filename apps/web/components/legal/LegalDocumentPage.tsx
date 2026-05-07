import type { LegalDocument } from '@/lib/cms'
import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

interface LegalDocumentPageProps {
  doc: LegalDocument
  indexIcon: LucideIcon
  alternateHref: string
  alternateLabel: string
  contactPrefix: string
}

export function LegalDocumentPage({
  doc,
  indexIcon: IndexIcon,
  alternateHref,
  alternateLabel,
  contactPrefix,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar pública */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AngoPress" className="w-auto h-8" />
            {/*  <span className="text-base font-bold tracking-tight text-brand-700">AngoPress</span> */}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/termos"
              className="text-sm transition-colors text-neutral-500 hover:text-brand-600"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-sm transition-colors text-neutral-500 hover:text-brand-600"
            >
              Privacidade
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl px-4 py-8 mx-auto space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 w-64 h-32 rounded-full left-1/4 bg-brand-950/25 blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
                <Sparkles size={13} />
                Legal
              </span>
              <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">{doc.title}</h1>
              <p className="text-sm text-brand-100/80">{doc.subtitle}</p>
            </div>
            <p className="self-start px-4 py-2 text-xs border rounded-xl border-white/10 bg-white/10 text-brand-100/70">
              Última actualização: {doc.lastUpdated}
            </p>
          </div>
        </section>

        <div className="flex items-start gap-6">
          <aside className="sticky hidden w-56 top-6 shrink-0 xl:flex xl:flex-col xl:gap-1">
            <div className="rounded-[20px] border border-neutral-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center rounded-lg h-7 w-7 bg-brand-50 text-brand-600">
                  <IndexIcon size={14} />
                </span>
                <p className="text-xs font-bold tracking-widest uppercase text-neutral-500">
                  Índice
                </p>
              </div>
              <nav className="space-y-0.5">
                {doc.sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    <span className="w-4 text-xs text-right shrink-0 text-neutral-300">
                      {index + 1}.
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>
              <div className="pt-3 mt-4 border-t border-neutral-100">
                <Link
                  href={alternateHref}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-brand-600"
                >
                  {alternateLabel} →
                </Link>
              </div>
            </div>
          </aside>

          <article className="flex-1 min-w-0 space-y-4">
            {doc.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center text-xs font-bold rounded-lg h-7 w-7 shrink-0 bg-brand-50 text-brand-600">
                    {index + 1}
                  </span>
                  <h2 className="text-base font-semibold text-neutral-900 title-strong">
                    {section.title}
                  </h2>
                </div>
                <div
                  className="prose prose-neutral prose-sm max-w-none text-neutral-600 [&_a]:text-brand-600 [&_a]:underline [&_strong]:text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}

            <div className="rounded-[20px] border border-brand-100 bg-brand-50/40 p-5 text-sm text-neutral-600">
              <p>
                {contactPrefix}{' '}
                <a href={`mailto:${doc.contact}`} className="font-medium underline text-brand-600">
                  {doc.contact}
                </a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
