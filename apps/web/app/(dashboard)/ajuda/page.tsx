import {
  BookOpen,
  BarChart2,
  CircleHelp,
  CreditCard,
  FileText,
  List,
  Mail,
  Megaphone,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getHelpContent } from '@/lib/cms'
import { FaqItem } from './FaqItem'

// Mapeamento icon-name → componente (para guias vindos do WP)
const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  List,
  Megaphone,
  BarChart2,
  Users,
  BookOpen,
  CreditCard,
  Mail,
  MessageSquare,
}

// Mapeamento category → icon para cabeçalho das FAQs
const CATEGORY_ICON: Record<string, LucideIcon> = {
  'Press Releases': FileText,
  Campanhas: Megaphone,
  'Jornalistas e Listas': Users,
  'Assinatura e Pagamento': CreditCard,
}

export default async function AjudaPage() {
  const { faqs, guides, contact } = await getHelpContent()

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
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
        <div className="relative space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
            <Sparkles size={13} />
            Centro de suporte
          </span>
          <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Ajuda e Suporte</h1>
          <p className="text-sm text-brand-100/80">
            Encontre respostas, guias rápidos e formas de contactar a equipa AngoPress.
          </p>
        </div>
      </section>

      {/* ── Guias rápidos ── */}
      <div className="rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpen size={16} />
          </span>
          <h2 className="font-display font-bold text-neutral-800">Guias rápidos</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {guides.map(({ icon, title, desc }) => {
            const Icon = ICON_MAP[icon] ?? FileText
            return (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 transition-colors hover:border-brand-100 hover:bg-brand-50/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-brand-600 border border-neutral-100">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CircleHelp size={16} />
          </span>
          <h2 className="font-display font-bold text-neutral-800">Perguntas frequentes</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {faqs.map(({ category, items }) => {
            const Icon = CATEGORY_ICON[category] ?? CircleHelp
            return (
              <div
                key={category}
                className="rounded-[20px] border border-neutral-200/80 bg-white px-6 py-5 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Icon size={15} className="text-brand-600" />
                  <h3 className="text-sm font-semibold text-neutral-700">{category}</h3>
                </div>
                {items.map((item) => (
                  <FaqItem key={item.question} q={item.question} a={item.answer} />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Contacto ── */}
      <div className="rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <MessageSquare size={16} />
          </span>
          <h2 className="font-display font-bold text-neutral-800">Ainda precisa de ajuda?</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <Mail size={20} />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{contact.emailLabel}</p>
              <p className="text-sm text-neutral-500">{contact.email}</p>
              <p className="mt-1 text-xs text-neutral-400">{contact.emailNote}</p>
            </div>
          </a>
          <a
            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{contact.whatsappLabel}</p>
              <p className="text-sm text-neutral-500">{contact.whatsapp}</p>
              <p className="mt-1 text-xs text-neutral-400">{contact.whatsappNote}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
