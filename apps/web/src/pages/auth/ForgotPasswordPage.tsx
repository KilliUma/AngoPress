import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '@/hooks/useAuth'

interface ForgotFormData {
  email: string
}

export function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>()

  const onSubmit = (data: ForgotFormData) => forgotPassword(data.email)

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recuperar password</h2>
        <p className="mt-1 text-sm text-gray-600">
          Lembrou-se?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Voltar ao login
          </Link>
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">
            Se o email existir na nossa base de dados, receberá as instruções em breve.
          </p>
        </div>
      ) : (
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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              disabled={isPending}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {isPending ? 'A enviar…' : 'Enviar instruções'}
          </button>
        </form>
      )}
    </div>
  )
}
