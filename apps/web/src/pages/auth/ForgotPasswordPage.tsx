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
    <div className="w-full">
      {isSuccess ? (
        <div className="text-center">
          {/* Ícone de sucesso */}
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-brand-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">Verifique o seu e-mail</h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Se o endereço existir na nossa base de dados, receberá as instruções de recuperação em
            breve.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Voltar ao login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Recuperar password
            </h2>
            <p className="mt-1.5 text-sm text-neutral-500">
              Lembrou-se?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Voltar ao login
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.ao"
                {...register('email', {
                  required: 'Email obrigatório',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
                className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 transition-colors"
                disabled={isPending}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Enviaremos um link de recuperação para o e-mail associado à sua conta.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isPending ? 'A enviar…' : 'Enviar instruções de recuperação'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
