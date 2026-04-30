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
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/auth.store'
import { useAdminStats } from '@/hooks/useAdmin'

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center gap-4">
      <div
        className={clsx('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', color)}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-neutral-100 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Painel Administrativo</h1>
          <p className="text-neutral-500 mt-1">
            Bem-vindo, {user?.name?.split(' ')[0]}. Gestão global da plataforma.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          ADMINISTRADOR
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Usuários activos"
          value={stats?.activeUsers ?? 0}
          icon={Users}
          color="bg-brand-600"
          loading={isLoading}
        />
        <StatCard
          label="Assinaturas activas"
          value={stats?.activeSubscriptions ?? 0}
          icon={CreditCard}
          color="bg-emerald-500"
          loading={isLoading}
        />
        <StatCard
          label="Envios totais"
          value={stats?.totalSends ?? 0}
          icon={Send}
          color="bg-amber-500"
          loading={isLoading}
        />
        <StatCard
          label="Receita mensal"
          value={revenue}
          icon={TrendingUp}
          color="bg-violet-500"
          loading={isLoading}
        />
      </div>

      {/* Acções rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" />
            <h2 className="font-semibold text-neutral-900">Acções rápidas</h2>
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
              >
                <Icon size={16} className="text-neutral-400 group-hover:text-brand-600 shrink-0" />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-2">Área de Administração</h2>
          <p className="text-neutral-300 text-sm mb-4">
            Aqui gere todos os recursos da plataforma — a base de dados de jornalistas (o produto
            core), clientes, assinaturas e planos.
          </p>
          <div className="space-y-2">
            {[
              {
                icon: Users,
                label: 'Importar/Exportar Jornalistas (CSV)',
                href: '/jornalistas',
              },
              { icon: CreditCard, label: 'Painel de Assinaturas', href: '/admin/assinaturas' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors"
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
