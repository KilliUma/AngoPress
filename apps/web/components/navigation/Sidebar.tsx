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
  ClipboardCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

// Navegação exclusiva do ADMINISTRADOR
const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Admin' },
  { to: '/admin/utilizadores', icon: Users, label: 'Utilizadores' },
  { to: '/admin/assinaturas', icon: CreditCard, label: 'Assinaturas' },
  { to: '/jornalistas', icon: FileText, label: 'Jornalistas' },
  { to: '/admin/planos', icon: List, label: 'Planos' },
  { to: '/admin/categorias', icon: ClipboardCheck, label: 'Categorias' },
  { to: '/admin/cadastros', icon: Users, label: 'Cadastros' },
]

// Navegação exclusiva do CLIENTE
const CLIENT_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jornalistas', icon: Users, label: 'Jornalistas' },
  { to: '/listas', icon: List, label: 'Listas de Mailing' },
  { to: '/press-releases', icon: FileText, label: 'Press Releases' },
  { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/assinatura', icon: CreditCard, label: 'Meu Plano' },
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
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isAdmin
            ? 'bg-neutral-900 border-r border-neutral-800'
            : 'bg-white border-r border-neutral-200',
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            'h-14 flex items-center justify-between px-5 border-b shrink-0',
            isAdmin ? 'border-neutral-800' : 'border-neutral-200',
          )}
        >
          <Link href={homeHref} className="flex flex-col justify-center" onClick={onClose}>
            <span
              className={clsx(
                'font-bold text-lg leading-tight',
                isAdmin ? 'text-white' : 'text-brand-700',
              )}
            >
              AngoPress
            </span>
            {isAdmin && (
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Administração
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'lg:hidden p-1 rounded hover:text-neutral-700',
              isAdmin ? 'text-neutral-400' : 'text-neutral-400',
            )}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

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
                    ? isAdmin
                      ? 'bg-brand-700 text-white'
                      : 'bg-brand-50 text-brand-700'
                    : isAdmin
                      ? 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
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
