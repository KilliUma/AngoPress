import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — AngoPress',
  description: 'Condições que regem o uso da plataforma AngoPress.',
}

export const revalidate = 3600

export default async function TermosPage() {
  const { termos: doc } = await getLegalContent()

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <header className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
            Legal
          </span>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900 title-strong">{doc.title}</h1>
          <p className="mt-2 text-neutral-600">{doc.subtitle}</p>
          <p className="mt-3 text-xs text-neutral-400">Última actualização: {doc.lastUpdated}</p>

          {/* Índice */}
          <nav className="mt-8 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Índice
            </p>
            <ol className="space-y-1">
              {doc.sections.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-right text-xs text-neutral-300">{i + 1}.</span>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {/* Secções */}
        <article className="mt-6 space-y-6">
          {doc.sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="flex items-baseline gap-3 text-lg font-semibold text-neutral-900 title-strong">
                <span className="text-sm font-normal text-brand">{i + 1}.</span>
                {s.title}
              </h2>
              <div
                className="prose prose-neutral mt-3 max-w-none text-neutral-600 [&_a]:text-brand [&_a]:underline [&_strong]:text-neutral-800"
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            </section>
          ))}
        </article>

        {/* Rodapé */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-sm text-neutral-400">
          <p>
            Dúvidas?{' '}
            <a href={`mailto:${doc.contact}`} className="text-brand underline">
              {doc.contact}
            </a>
          </p>
          <Link href="/privacidade" className="underline hover:text-neutral-600">
            Política de Privacidade
          </Link>
        </footer>
      </div>
    </main>
  )
}
