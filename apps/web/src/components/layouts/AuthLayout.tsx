import { Outlet, Link } from 'react-router-dom'

const BENEFITS = [
  'Base de jornalistas angolanos curada',
  'Envio em massa com personalização',
  'Analytics de aberturas e cliques',
  'Agendamento de campanhas',
]

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* ── Painel esquerdo (brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-700/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-900/60 blur-2xl" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(#D99D99 1px, transparent 1px), linear-gradient(90deg, #D99D99 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#D99D99"
                strokeWidth="2.5"
                strokeDasharray="72 30"
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  fontWeight: 900,
                  fill: '#fff',
                }}
              >
                A
              </text>
            </svg>
          </span>
          <span className="font-bold text-white text-xl tracking-tight">AngoPress</span>
        </Link>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
              A plataforma de imprensa
              <br />
              feita para Angola
            </h2>
            <p className="text-brand-300 text-base leading-relaxed">
              Distribua press releases, segmente jornalistas e acompanhe os resultados em tempo
              real.
            </p>
          </div>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-brand-200 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-600/60 border border-brand-500/60 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-neutral-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé */}
        <p className="relative z-10 text-xs text-brand-500">
          © {new Date().getFullYear()} AngoPress. Todos os direitos reservados.
        </p>
      </div>

      {/* ── Painel direito (formulário) ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-neutral-50">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <svg viewBox="0 0 36 36" className="w-9 h-9">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#8A0018"
                strokeWidth="2.5"
                strokeDasharray="72 30"
                strokeLinecap="round"
              />
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 17,
                  fontWeight: 900,
                  fill: '#8A0018',
                }}
              >
                A
              </text>
            </svg>
            <span className="font-bold text-brand-700 text-xl tracking-tight">AngoPress</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
