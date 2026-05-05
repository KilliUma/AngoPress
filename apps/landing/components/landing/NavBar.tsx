import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'

const NAV_LINKS = [
  ['Início', '/'],
  ['Sobre', '#sobre'],
  ['Como funciona', '#como-funciona'],
  ['Para quem é?', '#para-quem'],
  ['Notícias', '#noticias'],
  ['Preços', '#precos'],
]

export function NavBar() {
  const ASSESSOR_LOGIN_URL = 'https://ango-press-web-flame.vercel.app/login/'
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-gray-100" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-700/30 group-hover:shadow-brand-600/40 transition-shadow duration-300" />
            <span className="relative flex items-center justify-center w-full h-full text-white font-black text-[15px] tracking-tight">
              A
            </span>
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
            Ango<span className="text-brand-600">Press</span>
          </span>
        </a>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-0 flex-1 justify-center">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="relative px-3.5 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 group"
            >
              {label}
              <span className="absolute inset-x-3.5 bottom-1.5 h-px bg-brand-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200 rounded-full" />
            </a>
          ))}
          <JournalistRegisterModal variant="nav" />
        </nav>

        {/* Actions */}
        <div className="flex  items-center gap-1.5 flex-shrink-0">
          <a
            href={ASSESSOR_LOGIN_URL}
            className="group inline-flex ml-4 items-center gap-1.5 px-4 py-2 text-[13px] font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all duration-200 shadow-md shadow-brand-800/25 hover:shadow-brand-700/40 ring-1 ring-brand-500/20 hover:ring-brand-400/40"
          >
            Sou Assessor
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150"
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
    </header>
  )
}
