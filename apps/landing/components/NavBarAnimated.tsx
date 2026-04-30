'use client'

import { useEffect, useState } from 'react'
import { JournalistRegisterModal } from './JournalistRegisterModal'

interface Props {
  appUrl: string
}

export default function NavBarAnimated({ appUrl }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-900/96 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/50 flex-shrink-0 group-hover:bg-brand-500 transition-colors duration-200">
            <span
              className="text-white font-black text-base leading-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              A
            </span>
          </span>
          <span className="font-bold text-white text-lg tracking-tight">
            Ango<span className="text-brand-400">Press</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-0.5">
          {(
            [
              ['Início', '/'],
              ['Sobre', '#sobre'],
              ['Como funciona', '#como-funciona'],
              ['Para quem é?', '#para-quem'],
              ['Notícias', '#noticias'],
              ['Preços', '#precos'],
            ] as [string, string][]
          ).map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-3 py-1.5 text-sm text-brand-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150 link-underline"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <JournalistRegisterModal variant="nav" />
          <a
            href={`${appUrl}/login`}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all duration-150"
          >
            Entrar
          </a>
        </div>
      </div>
    </header>
  )
}
