import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'
import AnimateIn from '@/components/AnimateIn'
import { JournalistCtaContent, JOURNALIST_CTA_FALLBACK } from '@/lib/cms'

export function JournalistCTASection({ content }: { content?: JournalistCtaContent }) {
  const cms = content ?? JOURNALIST_CTA_FALLBACK
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/cta.jpg')" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900"
        style={{ opacity: 0.8 }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <AnimateIn variant="scale">
          <div className="relative grid items-start gap-10 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-12">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-bold text-brand-100">
                {cms.badge}
              </span>

              <h2 className="mb-4 text-3xl font-black leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
                {cms.titleLine1}
                <br />
                <span className="text-brand-100">{cms.titleLine2}</span>
              </h2>

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                {cms.description}
              </p>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <JournalistRegisterModal variant="cta" />
                <a
                  href={cms.secondaryCtaUrl}
                  className="text-sm font-medium text-white/70 transition-colors duration-150 hover:text-white"
                >
                  {cms.secondaryCtaLabel} →
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-[2px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Vantagem
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Receba releases segmentados por editoria com prioridade para conteúdos relevantes.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-brand-900/22 p-5 backdrop-blur-[2px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Comunidade
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Faça parte da rede de jornalistas da plataforma e amplie o alcance do seu
                  trabalho.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
