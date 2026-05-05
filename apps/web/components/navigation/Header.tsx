'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, ChevronDown, CircleHelp, CreditCard, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/auth.store'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { authService } from '@/services/auth.service'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

interface HeaderProps {
  isAdmin?: boolean
  onMenuToggle?: () => void
}

export function Header({ isAdmin = false, onMenuToggle }: HeaderProps) {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(profileDropdownRef, () => setIsProfileOpen(false))

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    clearAuth()
    setIsProfileOpen(false)
    router.push('/login')
  }

  const menuItems = [
    {
      label: 'Meu perfil',
      icon: User,
      onClick: () => {
        setIsProfileOpen(false)
        router.push('/perfil')
      },
    },
    {
      label: 'Assinatura',
      icon: CreditCard,
      onClick: () => {
        setIsProfileOpen(false)
        router.push('/assinatura')
      },
    },
    {
      label: 'Ajuda',
      icon: CircleHelp,
      onClick: () => {
        setIsProfileOpen(false)
        router.push('/ajuda')
      },
    },
  ]

  return (
    <header className="flex items-center justify-between gap-3 px-4 border-b h-16 sm:px-6 shrink-0 bg-white border-neutral-200">
      {/* Lado esquerdo */}
      <div className="flex items-center min-w-0 gap-2">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors mr-1"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        )}
        {isAdmin && (
          <span className="px-2.5 py-1 text-sm font-bold border rounded bg-brand-600/20 text-brand-300 border-brand-500/30 shrink-0">
            ADMIN
          </span>
        )}
        <Breadcrumbs />
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />

        {/* Perfil */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            title="Abrir perfil"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-1 py-1 pl-1 pr-1.5 transition-colors rounded-lg hover:bg-neutral-100"
          >
            <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full bg-brand-600 shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <ChevronDown
              size={14}
              className={clsx(
                'text-neutral-500 transition-transform',
                isProfileOpen && 'rotate-180',
              )}
            />
            <span className="sr-only">Abrir menu do perfil</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-black/20 overflow-hidden z-50">
              <div className="p-1.5 space-y-0.5">
                {menuItems.map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[15px] text-left text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <Icon size={15} className="text-neutral-500" />
                    <span>{label}</span>
                  </button>
                ))}

                <div className="h-px my-1 bg-neutral-200" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[15px] text-left text-red-300 rounded-lg hover:bg-red-500/15 transition-colors"
                >
                  <LogOut size={15} className="text-red-300" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
