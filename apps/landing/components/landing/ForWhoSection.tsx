import { SectionLabel } from './ui'
import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'
import AnimateIn from '@/components/AnimateIn'

const EMPRESA_BENEFITS = [
  'Gestão centralizada de campanhas',
  'Segmentação por área e veículo',
  'Relatórios de desempenho detalhados',
  'Agendamento de envios',
  'Base de dados actualizada de jornalistas',
  'Suporte por e-mail e WhatsApp',
]

const JORNALISTA_BENEFITS = [
  'Perfil com as suas editorias e veículo',
  'Receba apenas conteúdo do seu interesse',
  'Cadastro gratuito, aprovado pelo admin',
]

function CheckRow({ text, light }: { text: string; light?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${light ? 'bg-white/15' : 'bg-brand-50 border border-brand-200'}`}
      >
        <svg
          className={`w-2.5 h-2.5 ${light ? 'text-white/80' : 'text-brand-600'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
      <span className={`text-sm leading-relaxed ${light ? 'text-white/75' : 'text-gray-600'}`}>
        {text}
      </span>
    </li>
  )
}

export function ForWhoSection() {
  const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'
  return (
    <section id="para-quem" className="relative px-4 overflow-hidden py-28 sm:px-6">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-40" />

      <div className="relative max-w-6xl mx-auto">
        <div className="mb-16 text-center reveal">
          <SectionLabel>Para quem é?</SectionLabel>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            A plataforma certa para cada perfil
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Empresas */}
          <AnimateIn variant="left">
            <div className="relative flex flex-col h-full p-8 overflow-hidden border-0 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center mb-6 border w-11 h-11 rounded-xl bg-white/15 border-white/25">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-200 mb-2">
                  Para Empresas &amp; Assessorias
                </span>
                <h3 className="mb-3 text-2xl font-black leading-tight text-white">
                  Profissionalize a sua comunicação
                </h3>

                <ul className="flex-1 mb-10 space-y-3">
                  {EMPRESA_BENEFITS.map((b) => (
                    <CheckRow key={b} text={b} light />
                  ))}
                </ul>

                <a
                  href={`${APP_URL}/cadastro`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold bg-white text-brand-700 hover:bg-brand-50 rounded-xl transition-all duration-150 shadow-lg"
                >
                  Criar conta
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
                </a>
              </div>
            </div>
          </AnimateIn>

          {/* Jornalistas */}
          <AnimateIn variant="right">
            <div className="relative flex flex-col h-full p-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-100/50 blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-center mb-6 border w-11 h-11 rounded-xl bg-violet-50 border-violet-200">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                    />
                  </svg>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-2">
                  Para Jornalistas
                </span>
                <h3 className="mb-3 text-2xl font-black leading-tight text-gray-900">
                  Receba press releases relevantes
                </h3>

                <ul className="flex-1 mb-10 space-y-3">
                  {JORNALISTA_BENEFITS.map((b) => (
                    <CheckRow key={b} text={b} />
                  ))}
                </ul>

                <JournalistRegisterModal variant="card" />
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
