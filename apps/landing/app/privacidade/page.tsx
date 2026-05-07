import { getLegalContent } from '@/lib/cms'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — AngoPress',
  description: 'Como a AngoPress recolhe, usa e protege os seus dados pessoais.',
}

export const revalidate = 3600

export default async function PrivacidadePage() {
  const { privacidade: doc } = await getLegalContent()

  return (
    <main className="min-h-screen bg-[rgb(var(--background))] px-4 py-16 text-white">
      {/* Hero */}
      <header className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-brand">Legal</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">{doc.title}</h1>
        <p className="mt-3 text-lg text-white/60">{doc.subtitle}</p>
        <p className="mt-2 text-sm text-white/40">Última actualização: {doc.lastUpdated}</p>

        {/* Índice */}
        <nav className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
            Índice
          </p>
          <ol className="space-y-1">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                >
                  <span className="w-5 shrink-0 text-right text-xs text-white/30">{i + 1}.</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* Secções */}
      <article className="mx-auto mt-12 max-w-3xl space-y-10">
        {doc.sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-8">
            <h2 className="flex items-baseline gap-3 text-xl font-semibold">
              <span className="text-sm text-brand">{i + 1}.</span>
              {s.title}
            </h2>
            <div
              className="prose prose-invert mt-3 max-w-none text-white/70 [&_a]:text-brand [&_a]:underline [&_strong]:text-white/90"
              dangerouslySetInnerHTML={{ __html: s.content }}
            />
          </section>
        ))}
      </article>

      {/* Rodapé */}
      <footer className="mx-auto mt-16 max-w-3xl border-t border-white/10 pt-8 text-sm text-white/40">
        <p>
          Questões sobre privacidade? Contacte{' '}
          <a href={`mailto:${doc.contact}`} className="text-brand underline">
            {doc.contact}
          </a>
        </p>
        <p className="mt-3">
          <Link href="/termos" className="underline hover:text-white/70">
            Termos de Uso
          </Link>
        </p>
      </footer>
    </main>
  )
}
