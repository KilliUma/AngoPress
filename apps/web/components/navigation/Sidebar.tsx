'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

// ── Navegação CLIENTE ──────────────────────────────────────────
const CLIENT_NAV_SECTIONS = [
  {
    label: 'CORE',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'DISTRIBUIÇÃO',
    items: [
      { to: '/jornalistas', icon: Users, label: 'Jornalistas' },
      { to: '/listas', icon: List, label: 'Listas de Mailing' },
      { to: '/press-releases', icon: FileText, label: 'Press Releases' },
      { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
    ],
  },
  {
    label: 'ANÁLISE',
    items: [{ to: '/analytics', icon: BarChart2, label: 'Analytics' }],
  },
  {
    label: 'CONTA',
    items: [
      { to: '/assinatura', icon: CreditCard, label: 'Meu Plano' },
      { to: '/perfil', icon: User, label: 'Perfil' },
    ],
  },
]

// ── Navegação ADMIN ────────────────────────────────────────────
const ADMIN_NAV_SECTIONS = [
  {
    label: 'CORE',
    items: [{ to: '/admin', icon: LayoutDashboard, label: 'Dashboard Admin' }],
  },
  {
    label: 'GESTÃO',
    items: [
      { to: '/admin/utilizadores', icon: Users, label: 'Utilizadores' },
      { to: '/admin/assinaturas', icon: CreditCard, label: 'Assinaturas' },
      { to: '/admin/planos', icon: List, label: 'Planos' },
      { to: '/admin/categorias', icon: ClipboardCheck, label: 'Categorias' },
      { to: '/admin/cadastros', icon: Users, label: 'Cadastros' },
    ],
  },
  {
    label: 'CONTEÚDO',
    items: [{ to: '/jornalistas', icon: FileText, label: 'Jornalistas' }],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const sections = isAdmin ? ADMIN_NAV_SECTIONS : CLIENT_NAV_SECTIONS
  const homeHref = isAdmin ? '/admin' : '/dashboard'

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'bg-white border-r border-neutral-200',
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-200 shrink-0">
          <Link href={homeHref} className="flex items-center gap-3" onClick={onClose}>
            <Image
              src="/logo-red.png"
              alt="AngoPress"
              width={120}
              height={34}
              className="object-contain w-auto"
              style={{ height: '8rem' }}
              priority
            />
            {isAdmin && (
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider"></span>
            )}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label }) => {
                  const active = to === homeHref ? pathname === to : pathname.startsWith(to)
                  return (
                    <Link
                      key={to}
                      href={to}
                      onClick={onClose}
                      className={clsx(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                      )}
                    >
                      <Icon
                        size={17}
                        className={clsx(
                          'shrink-0 transition-transform',
                          active ? '' : 'group-hover:scale-110',
                        )}
                      />
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight size={13} className="opacity-60" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div className="px-3 py-4 border-t border-neutral-200 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-default">
            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full bg-brand-600 shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-neutral-900">
                {user?.name ?? 'Utilizador'}
              </p>
              <p className="text-[11px] text-neutral-500 truncate">
                {isAdmin ? 'Administrador' : 'Cliente'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
