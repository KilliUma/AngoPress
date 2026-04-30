'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  List,
  FileText,
  Megaphone,
  BarChart2,
  CreditCard,
  User,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

// Navegação exclusiva do ADMINISTRADOR
const ADMIN_NAV = [
  { to: '/admin', icon: ShieldCheck, label: 'Painel Admin' },
  { to: '/jornalistas', icon: Users, label: 'Jornalistas' },
  { to: '/listas', icon: List, label: 'Listas de Envio' },
  { to: '/press-releases', icon: FileText, label: 'Press Releases' },
  { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/assinatura', icon: CreditCard, label: 'Assinaturas' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

// Navegação exclusiva do CLIENTE
const CLIENT_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/press-releases', icon: FileText, label: 'Press Releases' },
  { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/assinatura', icon: CreditCard, label: 'Assinatura' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const NAV_ITEMS = isAdmin ? ADMIN_NAV : CLIENT_NAV
  const homeHref = isAdmin ? '/admin' : '/dashboard'

  return (
    <>
      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-200 shrink-0">
          <Link href={homeHref} className="flex items-center gap-2" onClick={onClose}>
            <svg viewBox="0 0 36 36" className="w-8 h-8 shrink-0">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#8A0018"
                strokeWidth="2.5"
                strokeDasharray="72 30"
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  fontWeight: 900,
                  fill: '#8A0018',
                }}
              >
                A
              </text>
            </svg>
            <span className="font-bold text-brand-700 text-lg">AngoPress</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded text-neutral-400 hover:text-neutral-700"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Badge de ambiente */}
        {isAdmin && (
          <div className="mx-3 mt-3 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-600 shrink-0" />
            <span className="text-xs font-semibold text-brand-700">Área de Administração</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = to === homeHref ? pathname === to : pathname.startsWith(to)
            return (
              <Link
                key={to}
                href={to}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                )}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
