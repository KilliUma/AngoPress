import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import { FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — AngoPress',
  description: 'Condições que regem o uso da plataforma AngoPress.',
}

export const revalidate = 3600

export default async function TermosPage() {
  const { termos: doc } = await getLegalContent()

  return (
    <div className="space-y-6">
      {/* ── Banner de topo ── */}
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
          <p className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs text-brand-100/70 self-start">
            Última actualização: {doc.lastUpdated}
          </p>
        </div>
      </section>

      {/* ── Layout de duas colunas ── */}
      <div className="flex gap-6 items-start">
        {/* Sidebar de navegação (sticky) */}
        <aside className="hidden xl:flex w-56 shrink-0 flex-col gap-1 sticky top-6">
          <div className="rounded-[20px] border border-neutral-200/80 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <FileText size={14} />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Índice</p>
            </div>
            <nav className="space-y-0.5">
              {doc.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <span className="w-4 shrink-0 text-right text-xs text-neutral-300">{i + 1}.</span>
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </nav>
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <Link
                href="/privacidade"
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-brand-600 transition-colors"
              >
                Política de Privacidade →
              </Link>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <article className="flex-1 min-w-0 space-y-4">
          {doc.sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-6 rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 text-xs font-bold">
                  {i + 1}
                </span>
                <h2 className="text-base font-semibold text-neutral-900 title-strong">{s.title}</h2>
              </div>
              <div
                className="prose prose-neutral prose-sm max-w-none text-neutral-600 [&_a]:text-brand-600 [&_a]:underline [&_strong]:text-neutral-800"
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            </section>
          ))}

          {/* Contacto */}
          <div className="rounded-[20px] border border-brand-100 bg-brand-50/40 p-5 text-sm text-neutral-600">
            <p>
              Dúvidas sobre estes termos? Contacte{' '}
              <a href={`mailto:${doc.contact}`} className="font-medium text-brand-600 underline">
                {doc.contact}
              </a>
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}
