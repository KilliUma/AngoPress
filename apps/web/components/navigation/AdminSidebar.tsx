'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Newspaper,
  Package,
  ClipboardCheck,
  ArrowLeft,
} from 'lucide-react'

const ADMIN_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/utilizadores', icon: Users, label: 'Utilizadores' },
  { to: '/admin/assinaturas', icon: CreditCard, label: 'Assinaturas' },
  { to: '/jornalistas', icon: Newspaper, label: 'Jornalistas' },
  { to: '/admin/planos', icon: Package, label: 'Planos' },
  { to: '/admin/categorias', icon: ClipboardCheck, label: 'Categorias' },
  { to: '/admin/cadastros', icon: ClipboardCheck, label: 'Cadastros' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-neutral-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-neutral-700 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo-white.png"
            alt="AngoPress"
            width={120}
            height={34}
            className="h-7 w-auto object-contain"
            priority
          />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {ADMIN_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to)
          return (
            <Link
              key={to}
              href={to}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-800 text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
              )}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Voltar ao dashboard */}
      <div className="p-3 border-t border-neutral-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors px-3 py-2"
        >
          <ArrowLeft size={14} />
          Voltar ao Dashboard
        </Link>
      </div>
    </aside>
  )
}
