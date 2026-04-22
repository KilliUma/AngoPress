import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { usePressReleases } from '@/hooks/usePressReleases'
import { useMailingLists } from '@/hooks/useMailingLists'
import { useJournalists } from '@/hooks/useJournalists'
import { useCreateCampaign, useSendCampaign } from '@/hooks/useCampaigns'

const STEPS = ['Press Release', 'Destinatários', 'Agendar & Enviar']

export function NewCampaignPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  // Step 0 — selecionar press release
  const [pressReleaseId, setPressReleaseId] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')

  // Step 1 — destinatários
  const [selectedListIds, setSelectedListIds] = useState<string[]>([])
  const [selectedJournalistIds, setSelectedJournalistIds] = useState<string[]>([])

  // Step 2 — agendar
  const [sendNow, setSendNow] = useState(true)
  const [scheduledAt, setScheduledAt] = useState('')

  const { data: prData } = usePressReleases({ status: 'PUBLISHED', limit: 50 })
  const { data: listsData } = useMailingLists()
  const { data: journalistsData } = useJournalists({ limit: 100 })

  const create = useCreateCampaign()
  const send = useSendCampaign()

  function toggleList(id: string) {
    setSelectedListIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleJournalist(id: string) {
    setSelectedJournalistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleFinish() {
    try {
      const campaign = await create.mutateAsync({
        pressReleaseId,
        name,
        subject,
        mailingListIds: selectedListIds,
        journalistIds: selectedJournalistIds,
        scheduledAt: !sendNow && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      })
      if (sendNow) {
        await send.mutateAsync(campaign.id)
      }
      navigate('/campanhas')
    } catch {
      /* toast already shown in hook */
    }
  }

  const step0Valid = pressReleaseId && name.trim() && subject.trim()
  const step1Valid = selectedListIds.length > 0 || selectedJournalistIds.length > 0
  const step2Valid = sendNow || Boolean(scheduledAt)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/campanhas')}
          className="text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900">Nova Campanha</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                i === step ? 'text-brand-600' : i < step ? 'text-green-600' : 'text-neutral-400'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  i < step
                    ? 'bg-green-600 text-white'
                    : i === step
                      ? 'bg-brand-600 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-neutral-200 mx-3" />}
          </div>
        ))}
      </div>

      {/* Step 0 — Press Release */}
      {step === 0 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-medium text-neutral-800">Selecionar Press Release</h2>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {prData?.data.map((pr) => (
              <label
                key={pr.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  pressReleaseId === pr.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="pr"
                  value={pr.id}
                  checked={pressReleaseId === pr.id}
                  onChange={() => setPressReleaseId(pr.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-800">{pr.title}</p>
                  {pr.summary && (
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{pr.summary}</p>
                  )}
                </div>
              </label>
            ))}
            {!prData?.data.length && (
              <p className="text-sm text-neutral-400 text-center py-4">
                Nenhum press release publicado.
                <br />
                Publique um antes de criar uma campanha.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Nome da campanha
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              placeholder="Ex: Lançamento Produto X — Maio 2026"
              className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Assunto do e-mail
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Ex: [AngoPress] Novo comunicado de imprensa"
              className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {/* Step 1 — Destinatários */}
      {step === 1 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-medium text-neutral-800">Selecionar Destinatários</h2>

          {/* Listas de mailing */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
              Listas de mailing
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {listsData?.map((list) => (
                <label
                  key={list.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedListIds.includes(list.id)
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedListIds.includes(list.id)}
                    onChange={() => toggleList(list.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{list.name}</p>
                    <p className="text-xs text-neutral-500">
                      {list._count?.contacts ?? 0} contactos
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Jornalistas individuais */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">
              Jornalistas individuais
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {journalistsData?.data.map((j) => (
                <label
                  key={j.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedJournalistIds.includes(j.id) ? 'bg-brand-50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedJournalistIds.includes(j.id)}
                    onChange={() => toggleJournalist(j.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{j.name}</p>
                    <p className="text-xs text-neutral-500">
                      {j.outlet} · {j.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {step1Valid && (
            <p className="text-xs text-brand-600 font-medium">
              {selectedListIds.length} lista(s) + {selectedJournalistIds.length} jornalista(s)
              selecionado(s)
            </p>
          )}
        </div>
      )}

      {/* Step 2 — Agendar */}
      {step === 2 && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-medium text-neutral-800">Quando enviar?</h2>
          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${
                sendNow ? 'border-brand-600 bg-brand-50' : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="when"
                checked={sendNow}
                onChange={() => setSendNow(true)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-neutral-800">Enviar imediatamente</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  O e-mail será enfileirado e enviado agora
                </p>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${
                !sendNow ? 'border-brand-600 bg-brand-50' : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="when"
                checked={!sendNow}
                onChange={() => setSendNow(false)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-800">Agendar para data/hora</p>
                <p className="text-xs text-neutral-500 mt-0.5 mb-2">
                  Escolha quando o envio deve ocorrer
                </p>
                {!sendNow && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                )}
              </div>
            </label>
          </div>

          {/* Resumo */}
          <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-1.5 text-neutral-600">
            <p>
              <span className="font-medium">Nome:</span> {name}
            </p>
            <p>
              <span className="font-medium">Listas:</span> {selectedListIds.length}
            </p>
            <p>
              <span className="font-medium">Jornalistas individuais:</span>{' '}
              {selectedJournalistIds.length}
            </p>
            <p>
              <span className="font-medium">Envio:</span>{' '}
              {sendNow
                ? 'Imediato'
                : scheduledAt
                  ? new Date(scheduledAt).toLocaleString('pt-PT')
                  : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate('/campanhas'))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          <ArrowLeft size={15} /> {step === 0 ? 'Cancelar' : 'Anterior'}
        </button>
        {step < 2 ? (
          <button
            type="button"
            disabled={(step === 0 && !step0Valid) || (step === 1 && !step1Valid)}
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40"
          >
            Próximo <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!step2Valid || create.isPending || send.isPending}
            onClick={handleFinish}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40"
          >
            {(create.isPending || send.isPending) && <Loader2 size={14} className="animate-spin" />}
            {sendNow ? 'Criar & Enviar' : 'Criar & Agendar'}
          </button>
        )}
      </div>
    </div>
  )
}
