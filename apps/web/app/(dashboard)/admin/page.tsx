'use client'

import Link from 'next/link'
import {
  Users,
  Send,
  TrendingUp,
  UserCheck,
  CreditCard,
  Settings,
  ClipboardCheck,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/auth.store'
import { useAdminStats } from '@/hooks/useAdmin'

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  loading,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  colorClass: string
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-neutral-200/80 bg-white p-5 shadow-sm">
      <div
        className={clsx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
          colorClass,
        )}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-neutral-100" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-neutral-900">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useAdminStats()

  const revenue = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(stats?.monthlyRevenueAoa ?? 0)

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
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
              <Sparkles size={13} />
              Gestão global
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">
              Painel Administrativo
            </h1>
            <p className="text-sm text-brand-100/80">
              Bem-vindo, {user?.name?.split(' ')[0]}. Gestão global da plataforma.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            ADMINISTRADOR
          </span>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Usuários activos"
          value={stats?.activeUsers ?? 0}
          icon={Users}
          colorClass="bg-brand-600"
          loading={isLoading}
        />
        <StatCard
          label="Assinaturas activas"
          value={stats?.activeSubscriptions ?? 0}
          icon={CreditCard}
          colorClass="bg-emerald-500"
          loading={isLoading}
        />
        <StatCard
          label="Envios totais"
          value={stats?.totalSends ?? 0}
          icon={Send}
          colorClass="bg-amber-500"
          loading={isLoading}
        />
        <StatCard
          label="Receita mensal"
          value={revenue}
          icon={TrendingUp}
          colorClass="bg-violet-500"
          loading={isLoading}
        />
      </div>

      {/* ── Acções rápidas + dark card ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck size={16} />
            </span>
            <h2 className="font-display font-bold text-neutral-800">Acções rápidas</h2>
          </div>
          <div className="space-y-1">
            {[
              { href: '/jornalistas', icon: Users, label: 'Gerir base de dados de jornalistas' },
              {
                href: '/admin/utilizadores',
                icon: UserCheck,
                label: 'Gerir utilizadores e clientes',
              },
              {
                href: '/admin/assinaturas',
                icon: CreditCard,
                label: 'Consultar assinaturas activas',
              },
              { href: '/admin/planos', icon: Settings, label: 'Gerir planos de preços' },
              {
                href: '/admin/categorias',
                icon: ClipboardCheck,
                label: 'Configurar categorias/editorias',
              },
              {
                href: '/admin/cadastros',
                icon: UserCheck,
                label: 'Aprovar cadastros de jornalistas',
              },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50 group"
              >
                <Icon
                  size={16}
                  className="shrink-0 text-neutral-400 group-hover:text-brand-600 transition-colors"
                />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] bg-neutral-900 p-6 text-white shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
              <Settings size={16} />
            </span>
            <h2 className="font-display font-bold">Área de Administração</h2>
          </div>
          <p className="mb-5 text-sm text-neutral-400">
            Gere todos os recursos da plataforma — a base de dados de jornalistas (o produto core),
            clientes, assinaturas e planos.
          </p>
          <div className="space-y-2">
            {[
              { icon: Users, label: 'Importar/Exportar Jornalistas (CSV)', href: '/jornalistas' },
              { icon: CreditCard, label: 'Painel de Assinaturas', href: '/admin/assinaturas' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
