import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { useResetPassword } from '@/hooks/useAuth'

interface ResetFormData {
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { mutate: resetPassword, isPending } = useResetPassword()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>()

  const onSubmit = (data: ResetFormData) => resetPassword({ token, password: data.password })

  if (!token) {
    return (
      <div className="w-full space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Link inválido</h2>
        <p className="text-sm text-gray-600">O link de reset é inválido ou expirou.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nova password</h2>
        <p className="mt-1 text-sm text-gray-600">Defina uma nova password para a sua conta.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nova password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
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
            {...register('confirmPassword', {
              required: 'Confirme a password',
              validate: (val) => val === watch('password') || 'As passwords não coincidem',
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
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
          {isPending ? 'A guardar…' : 'Redefinir password'}
        </button>
      </form>
    </div>
  )
}
