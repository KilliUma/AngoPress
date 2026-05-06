'use client'

import { useEffect, useRef, useState } from 'react'

const EDITORIAL_GROUPS = [
  {
    group: 'Política',
    items: [
      { value: 'POL_GOVERNO', label: 'Governo' },
      { value: 'POL_PUBLICAS', label: 'Políticas públicas' },
      { value: 'POL_INTER', label: 'Relações internacionais' },
    ],
  },
  {
    group: 'Economia & Negócios',
    items: [
      { value: 'ECO_EMPRESAS', label: 'Empresas' },
      { value: 'ECO_FINANCEIRO', label: 'Mercado financeiro' },
      { value: 'ECO_STARTUPS', label: 'Startups' },
      { value: 'ECO_EMPREGO', label: 'Emprego' },
      { value: 'ECO_INVEST', label: 'Investimentos' },
    ],
  },
  {
    group: 'Sociedade & Cotidiano',
    items: [
      { value: 'SOC_EDUCACAO', label: 'Educação' },
      { value: 'SOC_COMPORTAMENTO', label: 'Comportamento' },
      { value: 'SOC_SOCIAL', label: 'Social' },
      { value: 'SOC_URBANISMO', label: 'Urbanismo' },
    ],
  },
  {
    group: 'Cultura & Entretenimento',
    items: [
      { value: 'CUL_MUSICA', label: 'Música' },
      { value: 'CUL_CINEMA', label: 'Cinema' },
      { value: 'CUL_EVENTOS', label: 'Eventos' },
      { value: 'CUL_CELEBRIDADES', label: 'Celebridades' },
    ],
  },
  {
    group: 'Esportes',
    items: [
      { value: 'ESP_FUTEBOL', label: 'Futebol' },
      { value: 'ESP_BASQUETE', label: 'Basquete' },
      { value: 'ESP_RADICAIS', label: 'Radicais' },
      { value: 'ESP_LUTAS', label: 'Lutas' },
    ],
  },
  {
    group: 'Saúde',
    items: [
      { value: 'SAU_MEDICINA', label: 'Medicina' },
      { value: 'SAU_DOENCAS', label: 'Doenças' },
      { value: 'SAU_PUBLICA', label: 'Saúde pública' },
      { value: 'SAU_BEMESTAR', label: 'Bem-estar' },
    ],
  },
  {
    group: 'Ciência & Tecnologia',
    items: [
      { value: 'TEC_INOVACAO', label: 'Inovação' },
      { value: 'TEC_PESQUISAS', label: 'Pesquisas' },
      { value: 'TEC_IA', label: 'IA' },
      { value: 'TEC_TECNOLOGIA', label: 'Tecnologia' },
    ],
  },
  {
    group: 'Internacional',
    items: [{ value: 'INT_GEOPOLITICA', label: 'Geopolítica' }],
  },
  {
    group: 'Meio Ambiente',
    items: [
      { value: 'AMB_SUSTENTABILIDADE', label: 'Sustentabilidade' },
      { value: 'AMB_CLIMA', label: 'Clima' },
      { value: 'AMB_QUESTOES', label: 'Questões ambientais' },
    ],
  },
  {
    group: 'Educação',
    items: [
      { value: 'EDU_ENSINO', label: 'Ensino' },
      { value: 'EDU_UNIVERSIDADES', label: 'Universidades' },
      { value: 'EDU_ESCOLAS', label: 'Escolas' },
      { value: 'EDU_POLITICAS', label: 'Políticas educacionais' },
    ],
  },
  {
    group: 'Segurança',
    items: [
      { value: 'SEG_CRIMES', label: 'Crimes' },
      { value: 'SEG_INVESTIGACOES', label: 'Investigações' },
      { value: 'SEG_JUSTICA', label: 'Justiça' },
      { value: 'SEG_POLICIA', label: 'Polícia' },
    ],
  },
  {
    group: 'Agronegócio',
    items: [
      { value: 'AGR_AGRICULTURA', label: 'Agricultura' },
      { value: 'AGR_PECUARIA', label: 'Pecuária' },
      { value: 'AGR_RURAL', label: 'Mercado rural' },
    ],
  },
  {
    group: 'Turismo & Viagem',
    items: [
      { value: 'TUR_DESTINOS', label: 'Destinos' },
      { value: 'TUR_HOTELARIA', label: 'Hotelaria' },
    ],
  },
  {
    group: 'Moda & Lifestyle',
    items: [
      { value: 'MOD_TENDENCIAS', label: 'Tendências' },
      { value: 'MOD_COMPORTAMENTO', label: 'Comportamento' },
      { value: 'MOD_CONSUMO', label: 'Consumo' },
    ],
  },
  {
    group: 'Opinião / Colunas',
    items: [{ value: 'OPI_ARTIGO', label: 'Artigo' }],
  },
  {
    group: 'Outra',
    items: [{ value: 'OTHER', label: 'Outra (especificar)' }],
  },
]

// Lista plana para lookup por value
const ALL_ITEMS = EDITORIAL_GROUPS.flatMap((g) => g.items)

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

type Errors = Partial<Record<'name' | 'email' | 'outlet' | 'mediaType', string>>

function validate(data: Record<string, string>): Errors {
  const errors: Errors = {}
  if (!data.name || data.name.length < 2) errors.name = 'Nome obrigatório (mín. 2 caracteres)'
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'E-mail inválido'
  if (!data.outlet || data.outlet.length < 2) errors.outlet = 'Órgão de comunicação obrigatório'
  if (!data.mediaType) errors.mediaType = 'Seleccione pelo menos uma área de cobertura'
  return errors
}

export type JournalistRegisterModalVariant = 'nav' | 'card' | 'cta' | 'footer'

export function JournalistRegisterModal({
  variant = 'card',
  navClassName,
}: {
  variant?: JournalistRegisterModalVariant
  navClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<FormState>({ status: 'idle' })
  const [errors, setErrors] = useState<Errors>({})
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set())
  const [mediaTypeCustom, setMediaTypeCustom] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const toggleArea = (value: string) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const mediaTypeValue = Array.from(selectedAreas)
    .map((v) =>
      v === 'OTHER' ? mediaTypeCustom.trim() : (ALL_ITEMS.find((i) => i.value === v)?.label ?? v),
    )
    .filter(Boolean)
    .join(',')

  const handleOpen = () => {
    setState({ status: 'idle' })
    setErrors({})
    setSelectedAreas(new Set())
    setMediaTypeCustom('')
    setDropdownOpen(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setState({ status: 'idle' })
    setErrors({})
    setSelectedAreas(new Set())
    setMediaTypeCustom('')
    setDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    fd.forEach((v, k) => {
      data[k] = v as string
    })

    const errs = validate(data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setState({ status: 'submitting' })

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://angopress.vercel.app'
      const payload: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        outlet: data.outlet,
        mediaType: data.mediaType,
        jobTitle: data.jobTitle || undefined,
        city: data.city || undefined,
        message: data.message || undefined,
      }
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

      const res = await fetch(`${apiUrl}/api/v1/journalists/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = Array.isArray(err?.message)
          ? err.message[0]
          : (err?.message ?? 'Erro ao enviar pedido')
        setState({ status: 'error', message: msg })
        return
      }
      setState({ status: 'success' })
    } catch {
      setState({
        status: 'error',
        message: 'Não foi possível conectar ao servidor. Tente novamente.',
      })
    }
  }

  const ArrowIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )

  const inputBase =
    'w-full h-11 px-3.5 border rounded-xl text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-neutral-400'
  const inputOk = 'border-neutral-200 hover:border-neutral-300'
  const inputErr = 'border-red-400 bg-red-50/30 focus:ring-red-400 focus:border-red-400'

  const ErrMsg = ({ msg }: { msg: string }) => (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {msg}
    </p>
  )

  return (
    <>
      {variant === 'nav' && (
        <button
          onClick={handleOpen}
          className={
            navClassName ??
            'px-4 py-2 text-[15px] font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all duration-150 tracking-[-0.01em] whitespace-nowrap'
          }
        >
          Sou jornalista
        </button>
      )}
      {variant === 'card' && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-6 py-3 border border-brand-600 text-brand-600 text-sm font-bold rounded-xl hover:bg-brand-50 transition-colors"
        >
          Registar como jornalista
          <ArrowIcon />
        </button>
      )}
      {variant === 'cta' && (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 text-base font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
        >
          Registar como jornalista
          <ArrowIcon />
        </button>
      )}
      {variant === 'footer' && (
        <button onClick={handleOpen} className="hover:text-white transition-colors text-left">
          Registar-se
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {state.status === 'success' ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-green-200">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Pedido enviado!</h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-xs">
                  O seu pedido foi recebido com sucesso. A nossa equipa irá analisá-lo e entrar em
                  contacto pelo e-mail indicado em breve.
                </p>
                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-200"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <>
                <div className="relative flex-shrink-0">
                  <div className="h-1.5 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-600 rounded-t-3xl sm:rounded-t-2xl" />
                  <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
                    <div className="flex items-start gap-3.5">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-5 h-5 text-brand-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-neutral-900 leading-tight">
                          Registo de Jornalista
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                          Preencha os dados abaixo. A aprovação é feita pela nossa equipa.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="ml-3 flex-shrink-0 w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
                      aria-label="Fechar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="overflow-y-auto flex-1 px-6 py-5 space-y-5"
                >
                  {state.status === 'error' && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                      </svg>
                      <span>{state.message}</span>
                    </div>
                  )}

                  <fieldset>
                    <legend className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                      <span className="flex-1 h-px bg-neutral-100" />
                      Identificação
                      <span className="flex-1 h-px bg-neutral-100" />
                    </legend>
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                          Nome completo <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name"
                          placeholder="Maria da Silva"
                          className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                        />
                        {errors.name && <ErrMsg msg={errors.name} />}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                          E-mail profissional <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="maria@jornalangola.ao"
                          className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                        />
                        {errors.email && <ErrMsg msg={errors.email} />}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                      <span className="flex-1 h-px bg-neutral-100" />
                      Veículo & Cobertura
                      <span className="flex-1 h-px bg-neutral-100" />
                    </legend>
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                          Órgão / Veículo de comunicação <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="outlet"
                          placeholder="Jornal de Angola"
                          className={`${inputBase} ${errors.outlet ? inputErr : inputOk}`}
                        />
                        {errors.outlet && <ErrMsg msg={errors.outlet} />}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                          Áreas de cobertura <span className="text-red-500">*</span>
                          <span className="ml-1.5 normal-case font-normal text-neutral-400">
                            (pode escolher várias)
                          </span>
                        </label>
                        <input type="hidden" name="mediaType" value={mediaTypeValue} />
                        <div ref={dropdownRef} className="relative">
                          <button
                            type="button"
                            onClick={() => setDropdownOpen((o) => !o)}
                            className={`w-full h-11 px-3.5 flex items-center justify-between border rounded-xl text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.mediaType ? 'border-red-400 bg-red-50/30' : dropdownOpen ? 'border-brand-500 ring-2 ring-brand-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                          >
                            <span
                              className={
                                selectedAreas.size === 0
                                  ? 'text-neutral-400'
                                  : 'text-neutral-700 font-medium'
                              }
                            >
                              {selectedAreas.size === 0
                                ? 'Seleccione as áreas...'
                                : `${selectedAreas.size} área${selectedAreas.size > 1 ? 's' : ''} seleccionada${selectedAreas.size > 1 ? 's' : ''}`}
                            </span>
                            <svg
                              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m19 9-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {dropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                              {EDITORIAL_GROUPS.map((group) => (
                                <div key={group.group}>
                                  <div className="sticky top-0 bg-neutral-50/95 backdrop-blur-sm px-3 py-2 border-b border-neutral-100">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                      {group.group}
                                    </span>
                                  </div>
                                  {group.items.map((item) => (
                                    <label
                                      key={item.value}
                                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors ${selectedAreas.has(item.value) ? 'bg-brand-50' : 'hover:bg-neutral-50'}`}
                                    >
                                      <span
                                        className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedAreas.has(item.value) ? 'bg-brand-600 border-brand-600' : 'border-neutral-300'}`}
                                      >
                                        {selectedAreas.has(item.value) && (
                                          <svg
                                            className="w-2.5 h-2.5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="m4.5 12.75 6 6 9-13.5"
                                            />
                                          </svg>
                                        )}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={selectedAreas.has(item.value)}
                                        onChange={() => {
                                          toggleArea(item.value)
                                          if (item.value === 'OTHER') setMediaTypeCustom('')
                                        }}
                                        className="sr-only"
                                      />
                                      <span
                                        className={`text-sm ${selectedAreas.has(item.value) ? 'text-brand-700 font-medium' : 'text-neutral-700'}`}
                                      >
                                        {item.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedAreas.has('OTHER') && (
                          <input
                            type="text"
                            value={mediaTypeCustom}
                            onChange={(e) => setMediaTypeCustom(e.target.value)}
                            placeholder="Descreva a sua área de cobertura..."
                            className={`mt-2 ${inputBase} ${inputOk}`}
                          />
                        )}
                        {selectedAreas.size > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {Array.from(selectedAreas).map((v) => {
                              const label =
                                v === 'OTHER'
                                  ? mediaTypeCustom.trim() || 'Outra'
                                  : (ALL_ITEMS.find((i) => i.value === v)?.label ?? v)
                              return (
                                <span
                                  key={v}
                                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold"
                                >
                                  {label}
                                  <button
                                    type="button"
                                    onClick={() => toggleArea(v)}
                                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-200 transition-colors"
                                    aria-label={`Remover ${label}`}
                                  >
                                    <svg
                                      className="w-2.5 h-2.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {errors.mediaType && <ErrMsg msg={errors.mediaType} />}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                      <span className="flex-1 h-px bg-neutral-100" />
                      Detalhes adicionais
                      <span className="flex-1 h-px bg-neutral-100" />
                    </legend>
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                            Cargo
                          </label>
                          <input
                            name="jobTitle"
                            placeholder="Repórter"
                            className={`${inputBase} ${inputOk}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                            Cidade
                          </label>
                          <input
                            name="city"
                            placeholder="Luanda"
                            className={`${inputBase} ${inputOk}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1.5">
                          Mensagem{' '}
                          <span className="normal-case font-normal text-neutral-400">
                            (opcional)
                          </span>
                        </label>
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="Apresente-se brevemente, as suas áreas de cobertura, etc."
                          className="w-full px-3.5 py-2.5 border border-neutral-200 hover:border-neutral-300 rounded-xl text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-neutral-400 resize-none"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <div className="pt-1 pb-1">
                    <button
                      type="submit"
                      disabled={state.status === 'submitting'}
                      className="w-full h-12 bg-gradient-to-r from-brand-700 to-brand-500 text-white font-bold rounded-xl text-sm hover:from-brand-800 hover:to-brand-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-200/60"
                    >
                      {state.status === 'submitting' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          A enviar pedido...
                        </>
                      ) : (
                        <>
                          Submeter pedido de registo
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-neutral-400 mt-3">
                      Campos marcados com <span className="text-red-500">*</span> sao obrigatorios
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
