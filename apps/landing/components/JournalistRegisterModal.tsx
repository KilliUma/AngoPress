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
}: {
  variant?: JournalistRegisterModalVariant
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
      // remover campos undefined
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

  return (
    <>
      {/* ── Triggers ─────────────────────────────────────────────── */}
      {variant === 'nav' && (
        <button
          onClick={handleOpen}
          className="relative px-3.5 py-2 text-[13px] font-medium text-white/45 hover:text-white/90 rounded-lg transition-colors duration-150 group"
        >
          Sou jornalista
          <span className="absolute inset-x-3.5 bottom-1.5 h-px bg-brand-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200 rounded-full" />
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

      {/* ── Modal ────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {state.status === 'success' ? (
              /* ── Estado de sucesso ── */
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Pedido enviado!</h2>
                <p className="text-neutral-500 text-sm mb-6">
                  O seu pedido de registo foi recebido. A nossa equipa irá analisá-lo e entrar em
                  contacto em breve.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              /* ── Formulário ── */
              <>
                <div className="flex items-start justify-between p-5 border-b border-neutral-200">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Registo de Jornalista</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Submeta o seu pedido para integrar a nossa base de dados. A aprovação é feita
                      pelo administrador.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="ml-4 text-neutral-400 hover:text-neutral-600 flex-shrink-0"
                    aria-label="Fechar"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {state.status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      {state.message}
                    </div>
                  )}

                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      placeholder="Maria da Silva"
                      className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      E-mail profissional <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="maria@jornalangola.ao"
                      className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Veículo */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Órgão de comunicação / Veículo <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="outlet"
                      placeholder="Jornal de Angola"
                      className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {errors.outlet && <p className="text-xs text-red-500 mt-1">{errors.outlet}</p>}
                  </div>

                  {/* Tipo de Mídia — dropdown multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Tipo de Mídia <span className="text-red-500">*</span>
                      <span className="ml-1 text-xs font-normal text-neutral-400">
                        (pode escolher várias)
                      </span>
                    </label>
                    <input type="hidden" name="mediaType" value={mediaTypeValue} />

                    <div ref={dropdownRef} className="relative">
                      {/* Botão trigger */}
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((o) => !o)}
                        className={`w-full h-10 px-3 flex items-center justify-between border rounded-lg text-sm bg-white transition-colors ${
                          errors.mediaType ? 'border-red-400' : 'border-neutral-300'
                        } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                      >
                        <span
                          className={
                            selectedAreas.size === 0 ? 'text-neutral-400' : 'text-neutral-700'
                          }
                        >
                          {selectedAreas.size === 0
                            ? 'Seleccione as áreas…'
                            : `${selectedAreas.size} área${selectedAreas.size > 1 ? 's' : ''} seleccionada${selectedAreas.size > 1 ? 's' : ''}`}
                        </span>
                        <svg
                          className={`w-4 h-4 text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Painel */}
                      {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {EDITORIAL_GROUPS.map((group) => (
                            <div key={group.group}>
                              <div className="sticky top-0 bg-neutral-50 px-3 py-1.5 border-b border-neutral-100">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
                                  {group.group}
                                </span>
                              </div>
                              {group.items.map((item) => (
                                <label
                                  key={item.value}
                                  className="flex items-center gap-3 px-4 py-2 hover:bg-brand-50 cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAreas.has(item.value)}
                                    onChange={() => {
                                      toggleArea(item.value)
                                      if (item.value === 'OTHER') setMediaTypeCustom('')
                                    }}
                                    className="h-4 w-4 accent-brand-600 flex-shrink-0"
                                  />
                                  <span className="text-sm text-neutral-700">{item.label}</span>
                                </label>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Campo livre quando “Outra” está seleccionada */}
                    {selectedAreas.has('OTHER') && (
                      <input
                        type="text"
                        value={mediaTypeCustom}
                        onChange={(e) => setMediaTypeCustom(e.target.value)}
                        placeholder="Descreva a sua área de cobertura…"
                        className="mt-2 w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    )}

                    {/* Pills das seleccionadas */}
                    {selectedAreas.size > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Array.from(selectedAreas).map((v) => {
                          const label =
                            v === 'OTHER'
                              ? mediaTypeCustom.trim() || 'Outra'
                              : (ALL_ITEMS.find((i) => i.value === v)?.label ?? v)
                          return (
                            <span
                              key={v}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-medium"
                            >
                              {label}
                              <button
                                type="button"
                                onClick={() => toggleArea(v)}
                                className="hover:text-brand-900"
                                aria-label={`Remover ${label}`}
                              >
                                ×
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {errors.mediaType && (
                      <p className="text-xs text-red-500 mt-1">{errors.mediaType}</p>
                    )}
                  </div>

                  {/* Cargo + Cidade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Cargo
                      </label>
                      <input
                        name="jobTitle"
                        placeholder="Repórter"
                        className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Cidade
                      </label>
                      <input
                        name="city"
                        placeholder="Luanda"
                        className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Mensagem (opcional)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Apresente-se brevemente, as suas áreas de cobertura, etc."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={state.status === 'submitting'}
                    className="w-full h-11 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {state.status === 'submitting' && (
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
                    )}
                    Submeter pedido de registo
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
