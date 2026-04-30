import { SectionLabel } from './ui'
import AnimateIn from '@/components/AnimateIn'
import { HowItWorksContent, HOW_IT_WORKS_FALLBACK } from '@/lib/cms'

// Gradiente + glow por accent (mantido em código, não no CMS)
const STEP_STYLE: Record<string, { accent: string; glow: string }> = {
  brand: { accent: 'from-brand-500 to-brand-700', glow: 'shadow-brand-200' },
  violet: { accent: 'from-violet-500 to-violet-700', glow: 'shadow-violet-200' },
  emerald: { accent: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-200' },
}

// Ícones SVG por accent (mantido em código, não no CMS)
const FEATURE_ICON: Record<string, { icon: React.ReactNode; cls: string }> = {
  brand: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
    ),
    cls: 'text-brand-400 bg-brand-400/10 border border-brand-400/20',
  },
  blue: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
    cls: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  },
  violet: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
        />
      </svg>
    ),
    cls: 'text-violet-400 bg-violet-400/10 border border-violet-400/20',
  },
  emerald: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
    cls: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20',
  },
  amber: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    cls: 'text-amber-400 bg-amber-400/10 border border-amber-400/20',
  },
  cyan: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
        />
      </svg>
    ),
    cls: 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20',
  },
}

const STEP_NUMBERS = ['01', '02', '03']

export function HowItWorksSection({ content }: { content?: HowItWorksContent }) {
  const cms = content ?? HOW_IT_WORKS_FALLBACK
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173'

  const ctaHref = cms.ctaUrl.startsWith('http')
    ? cms.ctaUrl
    : `${APP_URL}${cms.ctaUrl.startsWith('/') ? '' : '/'}${cms.ctaUrl}`

  return (
    <section
      id="como-funciona"
      className="py-28 px-4 sm:px-6 bg-[rgb(var(--surface-2))] relative overflow-hidden"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #D99D99 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <AnimateIn variant="up">
            <SectionLabel>{cms.sectionLabel}</SectionLabel>
          </AnimateIn>
          <AnimateIn variant="up" delay={80}>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {cms.title}
            </h2>
          </AnimateIn>
          <AnimateIn variant="up" delay={160}>
            <p className="text-lg text-brand-300/70 max-w-lg mx-auto">{cms.subtitle}</p>
          </AnimateIn>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {cms.steps.map((step, i) => {
            const style = STEP_STYLE[step.accent] ?? STEP_STYLE.brand
            return (
              <AnimateIn key={i} variant="up" delay={i * 120}>
                <div className="relative group p-7 rounded-2xl bg-brand-900/60 border border-brand-800/60 hover:border-brand-600/60 hover:bg-brand-800/60 transition-all duration-300 h-full">
                  {/* Glow */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10 shadow-2xl ${style.glow}`}
                  />

                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.accent} text-white flex items-center justify-center mb-5 font-black text-base shadow-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    {STEP_NUMBERS[i] ?? String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Connector arrow between steps */}
                  {i < cms.steps.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-10 z-10">
                      <svg
                        className="w-6 h-6 text-brand-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </div>
                  )}

                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-brand-300/70 leading-relaxed">{step.description}</p>
                </div>
              </AnimateIn>
            )
          })}
        </div>

        {/* Features grid */}
        <AnimateIn variant="up">
          <h3 className="text-2xl font-black text-white text-center mb-8">{cms.featuresTitle}</h3>
        </AnimateIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {cms.features.map((feat, i) => {
            const fi = FEATURE_ICON[feat.accent] ?? FEATURE_ICON.brand
            return (
              <AnimateIn key={i} variant="up" delay={i * 60}>
                <div className="group p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 h-full flex gap-4 items-start">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${fi.cls}`}
                  >
                    {fi.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white/80 text-sm mb-1">{feat.title}</p>
                    <p className="text-xs text-white/35 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              </AnimateIn>
            )
          })}
        </div>

        {/* CTA */}
        <AnimateIn variant="up">
          <div className="text-center">
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-400 active:scale-95 transition-all duration-150 shadow-xl shadow-brand-600/30"
            >
              {cms.ctaLabel}
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
