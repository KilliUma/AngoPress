'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { authService } from '@/services/auth.service'

interface HeaderProps {
  isAdmin?: boolean
  onMenuToggle?: () => void
}

export function Header({ isAdmin = false, onMenuToggle }: HeaderProps) {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 mr-1"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        )}
        {isAdmin && (
          <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-1 rounded">
            ADMIN
          </span>
        )}
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <User size={16} />
          <span className="hidden sm:inline">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-600 transition-colors"
          title="Terminar sessão"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
