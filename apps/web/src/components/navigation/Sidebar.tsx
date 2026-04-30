import { NavLink } from 'react-router-dom'
import {
  X,
  LayoutDashboard,
  Users,
  List,
  FileText,
  Send,
  BarChart2,
  CreditCard,
  User,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jornalistas', label: 'Jornalistas', icon: Users },
  { to: '/listas', label: 'Listas de Mailing', icon: List },
  { to: '/press-releases', label: 'Press Releases', icon: FileText },
  { to: '/campanhas', label: 'Campanhas', icon: Send },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/assinatura', label: 'Meu Plano', icon: CreditCard },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'w-64 bg-brand-800 text-white flex flex-col shrink-0 z-30 transition-transform duration-200',
          'fixed lg:relative inset-y-0 left-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-brand-700 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-black">
              A
            </span>
            <span>AngoPress</span>
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-brand-300 hover:text-white"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-brand-200 hover:bg-brand-700 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Versão */}
        <div className="p-4 border-t border-brand-700 text-xs text-brand-400">AngoPress v1.0.0</div>
      </aside>
    </>
  )
}
