import { NavLink } from 'react-router-dom'
import {
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

export function Sidebar() {
  return (
    <aside className="w-64 bg-brand-800 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-brand-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm font-black">
            A
          </span>
          <span>AngoPress</span>
        </h1>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
  )
}
