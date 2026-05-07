import { DashboardLayout } from '@/components/layouts/DashboardLayout'
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
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-brand-950/25 blur-2xl" />
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
            <p className="self-start rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs text-brand-100/70">
              Última actualização: {doc.lastUpdated}
            </p>
          </div>
        </section>

        <div className="flex items-start gap-6">
          <aside className="sticky top-6 hidden w-56 shrink-0 xl:flex xl:flex-col xl:gap-1">
            <div className="rounded-[20px] border border-neutral-200/80 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <IndexIcon size={14} />
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
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
                    <span className="w-4 shrink-0 text-right text-xs text-neutral-300">
                      {index + 1}.
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <Link
                  href={alternateHref}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-brand-600"
                >
                  {alternateLabel} →
                </Link>
              </div>
            </div>
          </aside>

          <article className="min-w-0 flex-1 space-y-4">
            {doc.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
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
                <a href={`mailto:${doc.contact}`} className="font-medium text-brand-600 underline">
                  {doc.contact}
                </a>
              </p>
            </div>
          </article>
        </div>
      </div>
    </DashboardLayout>
  )
}
