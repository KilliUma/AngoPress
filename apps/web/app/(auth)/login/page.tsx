'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

type ApiError = { response?: { data?: { message?: string } } }

export default function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const serverMessage = (error as ApiError)?.response?.data?.message

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl tracking-tight text-neutral-900 title-strong">
          Bem-vindo de volta
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Não tem conta?{' '}
          <Link
            href="/cadastro"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isError && serverMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{serverMessage}</p>
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1"
          >
            Email
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nome@empresa.ao"
              {...register('email', {
                required: 'Email obrigatório',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
              className="block w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 transition-colors"
              disabled={isPending}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1"
          >
            Password
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="A sua password"
              {...register('password', { required: 'Password obrigatória' })}
              className="block w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-11 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 transition-colors"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 transition-colors hover:text-neutral-600 focus:outline-none focus:text-brand-600"
              aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
              aria-pressed={showPassword}
              disabled={isPending}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/esqueci-senha"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Esqueceu a password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {isPending ? 'A entrar…' : 'Entrar na conta'}
        </button>
      </form>
    </div>
  )
}
