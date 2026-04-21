import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

export function LoginPage() {
  const { mutate: login, isPending } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sessão</h2>
        <p className="mt-1 text-sm text-gray-600">
          Não tem conta?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Registar
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', {
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
            autoComplete="current-password"
            {...register('password', { required: 'Password obrigatória' })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 disabled:bg-gray-50"
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Esqueceu a password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {isPending ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
