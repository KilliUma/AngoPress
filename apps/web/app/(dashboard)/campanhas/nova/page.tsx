'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Send, Calendar, Check, Sparkles } from 'lucide-react'
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Banner de topo ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 w-64 h-32 rounded-full left-1/4 bg-brand-950/25 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
        </div>
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-100/80 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft size={13} /> Campanhas
              </button>
              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 w-fit">
                <Sparkles size={13} />
                Disparo de email
              </span>
              <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Nova Campanha</h1>
              <p className="text-sm text-brand-100/80">
                Configure o disparo de um press release para jornalistas.
              </p>
            </div>
          </div>
          {/* Stepper integrado no banner */}
          <div className="flex items-center gap-0 pt-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      s.id === step
                        ? 'bg-white text-brand-700'
                        : currentIndex > i
                          ? 'bg-emerald-400 text-white'
                          : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {currentIndex > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      s.id === step ? 'text-white' : 'text-brand-100/60'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 ${currentIndex > i ? 'bg-emerald-400/50' : 'bg-white/20'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: Lançamento Produto Q1 2026"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Assunto do email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('subject', { required: 'Assunto obrigatório' })}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Ex: [Press Release] Lançamento do novo produto"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Press Release <span className="text-red-500">*</span>
              </label>
              <select
                {...register('pressReleaseId', { required: 'Seleccione um press release' })}
                className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">-- Seleccionar press release --</option>
                {pressReleases.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.title}
                  </option>
                ))}
              </select>
              {errors.pressReleaseId && (
                <p className="mt-1 text-xs text-red-500">{errors.pressReleaseId.message}</p>
              )}
              {pressReleases.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Não tem press releases. Crie um primeiro.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goNext}
                disabled={!watch('name') || !watch('subject') || !watch('pressReleaseId')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
              <p className="mb-3 text-sm font-medium text-neutral-700">
                Seleccione as listas de mailing <span className="text-red-500">*</span>
              </p>
              {mailingLists.length === 0 ? (
                <p className="py-6 text-sm text-center text-neutral-400">
                  Não tem listas de mailing. Crie uma em{' '}
                  <a href="/listas" className="underline text-brand-600">
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={selectedLists.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
                <span className="text-xs text-center text-neutral-500">
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
                <span className="text-xs text-center text-neutral-500">
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
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}

            {/* Resumo */}
            <div className="p-4 space-y-2 text-sm rounded-lg bg-neutral-50">
              <p className="mb-2 font-medium text-neutral-800">Resumo</p>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
              <button
                type="submit"
                disabled={createCampaign.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createCampaign.isPending ? (
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
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
