import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

interface HeaderProps {
  isAdmin?: boolean
}

export function Header({ isAdmin = false }: HeaderProps) {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        {isAdmin && (
          <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-1 rounded">
            ADMIN
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <User size={16} />
          <span>{user?.name}</span>
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
