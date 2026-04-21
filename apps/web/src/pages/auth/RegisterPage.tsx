import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'

interface RegisterFormData {
  name: string
  email: string
  company: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const { mutate: register, isPending } = useRegister()
  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterFormData) => register(data)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="mt-1 text-sm text-gray-600">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Iniciar sessão
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...field('name', {
              required: 'Nome obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Empresa / Organização
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            {...field('company', { required: 'Empresa obrigatória' })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...field('email', {
              required: 'Email obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...field('password', {
              required: 'Password obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...field('confirmPassword', {
              required: 'Confirme a password',
              validate: (val) => val === watch('password') || 'As passwords não coincidem',
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {isPending ? 'A criar conta…' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}
