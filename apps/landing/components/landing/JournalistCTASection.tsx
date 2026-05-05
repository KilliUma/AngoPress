import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'
import AnimateIn from '@/components/AnimateIn'
import { JournalistCtaContent, JOURNALIST_CTA_FALLBACK } from '@/lib/cms'

export function JournalistCTASection({ content }: { content?: JournalistCtaContent }) {
  const cms = content ?? JOURNALIST_CTA_FALLBACK
  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gray-50" />

      <div className="relative max-w-4xl mx-auto">
        <AnimateIn variant="scale">
          <div className="relative rounded-2xl px-8 py-16 text-center overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 border-0 shadow-2xl shadow-brand-900/40">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-brand-500/20 blur-3xl" />
            </div>
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-200 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6">
                {cms.badge}
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                {cms.titleLine1}
                <br />
                <span className="text-brand-200">{cms.titleLine2}</span>
              </h2>
              <p className="text-white/70 max-w-md mx-auto mb-8 text-base leading-relaxed">
                {cms.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <JournalistRegisterModal variant="cta" />
                <a
                  href={cms.secondaryCtaUrl}
                  className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors duration-150"
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
