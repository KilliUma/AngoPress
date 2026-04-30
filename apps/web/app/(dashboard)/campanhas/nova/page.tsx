'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Send, Calendar, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/Card'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { usePressReleases } from '@/hooks/usePressReleases'
import { useMailingLists } from '@/hooks/useMailingLists'
import type { CreateCampaignPayload } from '@/services/campaigns.service'

type Step = 'conteudo' | 'destinatarios' | 'envio'

const STEPS: { id: Step; label: string }[] = [
  { id: 'conteudo', label: 'Conteúdo' },
  { id: 'destinatarios', label: 'Destinatários' },
  { id: 'envio', label: 'Envio' },
]

export default function NovaCampanhaPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('conteudo')
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCampaignPayload & { scheduledAt?: string }>()
  const { data: prData } = usePressReleases({ limit: 100 })
  const { data: listsData } = useMailingLists()
  const createCampaign = useCreateCampaign()

  const pressReleases = prData?.data || []
  const mailingLists = listsData || []

  const currentIndex = STEPS.findIndex((s) => s.id === step)

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateCampaignPayload = {
      pressReleaseId: values.pressReleaseId,
      name: values.name,
      subject: values.subject,
      mailingListIds: selectedLists,
      ...(scheduleMode === 'later' && values.scheduledAt
        ? { scheduledAt: new Date(values.scheduledAt).toISOString() }
        : {}),
    }
    const campaign = await createCampaign.mutateAsync(payload)
    router.push(`/campanhas/${campaign.id}`)
  })

  const goNext = () => {
    if (step === 'conteudo') setStep('destinatarios')
    else if (step === 'destinatarios') setStep('envio')
  }

  const goBack = () => {
    if (step === 'destinatarios') setStep('conteudo')
    else if (step === 'envio') setStep('destinatarios')
    else router.back()
  }

  const toggleList = (id: string) =>
    setSelectedLists((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">Nova Campanha</h1>
        <p className="text-neutral-500 mt-1">Crie e configure o disparo de um press release.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s.id === step
                    ? 'bg-brand-600 text-white'
                    : currentIndex > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {currentIndex > i ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  s.id === step ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 ${currentIndex > i ? 'bg-emerald-300' : 'bg-neutral-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit}>
        {/* Passo 1: Conteúdo */}
        {step === 'conteudo' && (
          <Card className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nome da campanha <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: 'Nome obrigatório' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: Lançamento Produto Q1 2026"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Assunto do email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('subject', { required: 'Assunto obrigatório' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: [Press Release] Lançamento do novo produto"
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Press Release <span className="text-red-500">*</span>
              </label>
              <select
                {...register('pressReleaseId', { required: 'Seleccione um press release' })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                <option value="">-- Seleccionar press release --</option>
                {pressReleases.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.title}
                  </option>
                ))}
              </select>
              {errors.pressReleaseId && (
                <p className="text-red-500 text-xs mt-1">{errors.pressReleaseId.message}</p>
              )}
              {pressReleases.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  Não tem press releases. Crie um primeiro.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goNext}
                disabled={!watch('name') || !watch('subject') || !watch('pressReleaseId')}
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Seguinte <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        )}

        {/* Passo 2: Destinatários */}
        {step === 'destinatarios' && (
          <Card className="space-y-5">
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-3">
                Seleccione as listas de mailing <span className="text-red-500">*</span>
              </p>
              {mailingLists.length === 0 ? (
                <p className="text-neutral-400 text-sm text-center py-6">
                  Não tem listas de mailing. Crie uma em{' '}
                  <a href="/listas" className="text-brand-600 underline">
                    Listas de Mailing
                  </a>
                  .
                </p>
              ) : (
                <div className="space-y-2">
                  {mailingLists.map(
                    (list: { id: string; name: string; _count?: { contacts: number } }) => (
                      <label
                        key={list.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLists.includes(list.id)
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => toggleList(list.id)}
                          className="accent-brand-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{list.name}</p>
                          <p className="text-xs text-neutral-500">
                            {list._count?.contacts || 0} contactos
                          </p>
                        </div>
                      </label>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={selectedLists.length === 0}
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Seguinte <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        )}

        {/* Passo 3: Envio */}
        {step === 'envio' && (
          <Card className="space-y-5">
            <p className="text-sm font-medium text-neutral-700">Quando enviar?</p>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors ${
                  scheduleMode === 'now'
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={scheduleMode === 'now'}
                  onChange={() => setScheduleMode('now')}
                  className="sr-only"
                />
                <Send
                  size={22}
                  className={scheduleMode === 'now' ? 'text-brand-600' : 'text-neutral-400'}
                />
                <span className="text-sm font-medium text-neutral-800">Enviar agora</span>
                <span className="text-xs text-neutral-500 text-center">
                  O email é enviado imediatamente
                </span>
              </label>

              <label
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors ${
                  scheduleMode === 'later'
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={scheduleMode === 'later'}
                  onChange={() => setScheduleMode('later')}
                  className="sr-only"
                />
                <Calendar
                  size={22}
                  className={scheduleMode === 'later' ? 'text-brand-600' : 'text-neutral-400'}
                />
                <span className="text-sm font-medium text-neutral-800">Agendar</span>
                <span className="text-xs text-neutral-500 text-center">
                  Definir data e hora de envio
                </span>
              </label>
            </div>

            {scheduleMode === 'later' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Data e hora de envio
                </label>
                <input
                  type="datetime-local"
                  {...register('scheduledAt')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}

            {/* Resumo */}
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-neutral-800 mb-2">Resumo</p>
              <div className="flex justify-between text-neutral-600">
                <span>Nome:</span>
                <span className="font-medium text-neutral-900">{watch('name')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Assunto:</span>
                <span className="font-medium text-neutral-900 truncate max-w-[200px]">
                  {watch('subject')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Listas:</span>
                <span className="font-medium text-neutral-900">
                  {selectedLists.length} seleccionadas
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                type="submit"
                disabled={createCampaign.isPending}
                className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {createCampaign.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {scheduleMode === 'now' ? 'Criar e Enviar' : 'Criar e Agendar'}
              </button>
            </div>
          </Card>
        )}
      </form>
    </div>
  )
}
