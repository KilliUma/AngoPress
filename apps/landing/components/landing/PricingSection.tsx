import { SectionLabel, CheckIcon } from './ui'
import AnimateIn from '@/components/AnimateIn'
import type { Plan } from './types'
import { PRICING_FALLBACK, type PricingContent } from '@/lib/cms'

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: 0,
    maxSendsMonth: 1000,
    maxJournalists: 200,
    features: [
      'Acesso à plataforma',
      'Segmentação simples',
      'Relatórios básicos',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 14999,
    maxSendsMonth: 5000,
    maxJournalists: 1000,
    features: [
      'Segmentação avançada',
      'Acesso completo à base',
      'Relatórios detalhados',
      'Agendamento de campanhas',
      'Personalização de envios',
    ],
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: 39999,
    maxSendsMonth: 20000,
    maxJournalists: 9999,
    features: [
      'Suporte prioritário',
      'Relatórios avançados',
      'Gestão de múltiplos utilizadores',
      'SLA garantido',
      'Gestor de conta dedicado',
    ],
  },
]

function formatKz(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(value)
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'
  const isPro = plan.name === 'Profissional'
  const isFree = plan.price === 0

  return (
    <AnimateIn variant="up" delay={index * 100}>
      <div
        className={`relative flex flex-col h-full rounded-2xl p-7 transition-all duration-300 card-hover ${
          isPro
            ? 'bg-gradient-to-b from-brand-900/80 to-[rgb(var(--surface-1))] border border-brand-500/40 shadow-2xl shadow-brand-900/50 ring-1 ring-brand-400/10'
            : 'bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12]'
        }`}
      >
        {isPro && (
          <>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-600/5 to-transparent pointer-events-none" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-brand-800/50">
              Mais popular
            </span>
          </>
        )}

        <div className="mb-6 relative">
          <p
            className={`font-bold text-xs uppercase tracking-widest mb-1 ${isPro ? 'text-brand-400' : 'text-white/30'}`}
          >
            {plan.name}
          </p>
          {plan.description && (
            <p className={`text-xs mb-3 ${isPro ? 'text-brand-300/60' : 'text-white/25'}`}>
              {plan.description}
            </p>
          )}
          {isFree ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">Grátis</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{formatKz(plan.price)}</span>
              <span className={`text-sm ${isPro ? 'text-brand-400' : 'text-white/30'}`}>/mês</span>
            </div>
          )}
          <p className={`text-xs mt-1.5 ${isPro ? 'text-brand-400/70' : 'text-white/25'}`}>
            {plan.maxSendsMonth === -1 ? 'Envios ilimitados' : `${plan.maxSendsMonth} envios/mês`}
            {plan.maxJournalists !== -1 && ` · até ${plan.maxJournalists} jornalistas`}
          </p>
        </div>

        <ul className="space-y-2.5 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckIcon
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPro ? 'text-brand-400' : 'text-white/30'}`}
              />
              <span className={`text-sm ${isPro ? 'text-white/70' : 'text-white/40'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <a
          href={`${APP_URL}/cadastro?plan=${plan.id}`}
          className={`w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
            isPro
              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 glow-brand-xs'
              : 'bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white border border-white/[0.08]'
          }`}
        >
          {isFree ? 'Começar grátis' : 'Escolher plano'}
        </a>
      </div>
    </AnimateIn>
  )
}

export function PricingSection({ plans, content }: { plans: Plan[]; content?: PricingContent }) {
  const activePlans = plans.length > 0 ? plans : FALLBACK_PLANS
  const cms = content ?? PRICING_FALLBACK

  return (
    <section id="precos" className="relative py-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[rgb(var(--surface-1))]" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal">
          <SectionLabel>{cms.sectionLabel}</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-3 mb-4">
            {cms.title}
          </h2>
          <p className="text-base text-white/40 max-w-lg mx-auto">{cms.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {activePlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        <AnimateIn variant="up" delay={300}>
          <div className="mt-10 bg-brand-900/60 border border-brand-700/30 rounded-2xl p-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white/80 mb-1">{cms.paymentTitle}</p>
              <p
                className="text-sm text-white/40 leading-relaxed [&_strong]:text-white/60"
                dangerouslySetInnerHTML={{ __html: cms.paymentDescription }}
              />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
