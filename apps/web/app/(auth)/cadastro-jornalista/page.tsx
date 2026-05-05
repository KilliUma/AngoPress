'use client'

import type { CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { NetworkBackground } from '@/components/layouts/NetworkBackground'
import {
  journalistsService,
  type JournalistRegistrationPayload,
  type MediaType,
} from '@/services/journalists.service'

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'TV', label: 'Televisão' },
  { value: 'RADIO', label: 'Rádio' },
  { value: 'PRINT', label: 'Imprensa Escrita' },
  { value: 'DIGITAL', label: 'Digital / Online' },
  { value: 'PODCAST', label: 'Podcast' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(100),
  email: z.string().email('E-mail inválido'),
  outlet: z.string().min(2, 'Veículo/Órgão obrigatório').max(150),
  mediaType: z.enum(['TV', 'RADIO', 'PRINT', 'DIGITAL', 'PODCAST'] as const),
  jobTitle: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function JournalistRegisterPage() {
  const NETWORK_STYLE = {
    '--net-edge': 'rgb(255 255 255 / 0.28)',
    '--net-dot-outer': 'rgb(255 255 255 / 0.65)',
    '--net-dot-core': 'rgb(255 255 255 / 0.95)',
    '--net-travel': 'rgb(255 255 255 / 0.92)',
    '--net-avatar': 'rgb(255 255 255 / 0.92)',
  } as CSSProperties
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: JournalistRegistrationPayload) =>
      journalistsService.submitRegistration(data),
    onSuccess: () => reset(),
    onError: (e: Error) => toast.error(e.message || 'Erro ao enviar pedido'),
  })

  if (mutation.isSuccess) {
    return (
      <div className="relative flex items-center justify-center min-h-screen p-4 isolate">
        {/* Fixed decorative background */}
        <div
          className="fixed inset-0 bg-gradient-to-br from-brand-600 to-brand-900"
          style={{ zIndex: -1 }}
        />
        <div className="fixed inset-0 opacity-40" style={{ ...NETWORK_STYLE, zIndex: -1 }}>
          <NetworkBackground />
        </div>
        <div className="w-full max-w-md p-10 text-center border shadow-xl bg-white/10 border-white/20 backdrop-blur-sm rounded-2xl">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-white" />
          <h2 className="mb-2 text-xl font-bold text-white">Pedido enviado!</h2>
          <p className="mb-6 text-sm text-white/70">
            O seu pedido de registo foi recebido. A nossa equipa irá analisá-lo e entrar em contacto
            em breve.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold underline transition-colors text-white/80 hover:text-white underline-offset-2"
          >
            Ir para o início de sessão
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 py-12 isolate">
      {/* Fixed decorative background */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-brand-600 to-brand-900"
        style={{ zIndex: -1 }}
      />
      <div className="fixed inset-0 opacity-40" style={{ ...NETWORK_STYLE, zIndex: -1 }}>
        <NetworkBackground />
      </div>

      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-xl font-bold text-white">
            <span className="flex items-center justify-center w-8 h-8 text-sm font-black bg-white rounded-full text-brand-700">
              A
            </span>
            AngoPress
          </div>
          <h1 className="text-2xl font-bold text-white">Registo de Jornalista</h1>
          <p className="mt-2 text-sm text-white/70">
            Submeta o seu pedido para integrar a nossa base de dados de jornalistas angolanos. A
            aprovação é feita pelo administrador.
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-6 space-y-5 border shadow-xl bg-white/10 border-white/15 backdrop-blur-sm rounded-2xl sm:p-8"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Maria da Silva"
              className="w-full h-10 px-3 text-sm text-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              E-mail profissional <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="maria@jornalangola.ao"
              className="w-full h-10 px-3 text-sm text-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              Órgão de comunicação / Veículo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('outlet')}
              placeholder="Jornal de Angola"
              className="w-full h-10 px-3 text-sm text-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
            />
            {errors.outlet && <p className="mt-1 text-xs text-red-500">{errors.outlet.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              Tipo de mídia <span className="text-red-500">*</span>
            </label>
            <select
              {...register('mediaType')}
              className="w-full h-10 px-3 text-sm text-white bg-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
            >
              <option value="">Seleccione…</option>
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.mediaType && (
              <p className="mt-1 text-xs text-red-500">{errors.mediaType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-white/80">Cargo</label>
              <input
                {...register('jobTitle')}
                placeholder="Repórter"
                className="w-full h-10 px-3 text-sm text-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-white/80">Cidade</label>
              <input
                {...register('city')}
                placeholder="Luanda"
                className="w-full h-10 px-3 text-sm text-white border rounded-lg bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              Mensagem (opcional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Apresente-se brevemente, as suas áreas de cobertura, etc."
              className="w-full px-3 py-2 text-sm text-white border rounded-lg resize-none bg-white/10 border-white/20 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center w-full gap-2 text-sm font-semibold bg-white text-brand-700 h-11 rounded-xl hover:bg-white/90 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Submeter pedido de registo
          </button>

          <p className="text-xs text-center text-white/55">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 hover:underline">
              Iniciar sessão
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
