import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'
import AnimateIn from '@/components/AnimateIn'
import { JournalistCtaContent, JOURNALIST_CTA_FALLBACK } from '@/lib/cms'

export function JournalistCTASection({ content }: { content?: JournalistCtaContent }) {
  const cms = content ?? JOURNALIST_CTA_FALLBACK
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[rgb(var(--surface))]" />

      <div className="relative max-w-4xl mx-auto">
        <AnimateIn variant="scale">
          <div className="relative rounded-2xl px-8 py-16 text-center overflow-hidden border border-brand-700/30 bg-gradient-to-b from-brand-900/40 to-[rgb(var(--surface))]">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-brand-600/10 blur-3xl" />
            </div>
            {/* Grid */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none rounded-2xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 bg-brand-400/10 border border-brand-400/20 px-4 py-1.5 rounded-full mb-6">
                {cms.badge}
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {cms.titleLine1}
                <br />
                <span className="text-gradient">{cms.titleLine2}</span>
              </h2>
              <p className="text-white/40 max-w-md mx-auto mb-8 text-base leading-relaxed">
                {cms.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <JournalistRegisterModal variant="cta" />
                <a
                  href={cms.secondaryCtaUrl}
                  className="text-sm font-medium text-white/35 hover:text-white/70 transition-colors duration-150"
                >
                  {cms.secondaryCtaLabel} →
                </a>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
