'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'

const NAV_LINKS = [
  ['Início', '/'],
  ['Sobre', '#sobre'],
  ['Como funciona', '#como-funciona'],
  ['Para quem é?', '#para-quem'],
  ['Notícias', '/noticias'],
  ['Preços', '#precos'],
]

export function NavBar({ transparentUntil = 12 }: { transparentUntil?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ASSESSOR_LOGIN_URL = 'https://angopress.vercel.app/login'
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > transparentUntil)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparentUntil])

  return (
    <>
      {/* Accent line at top */}
      <div
        className={`fixed inset-x-0 top-0 z-50 h-[2px] bg-gradient-to-r from-transparent ${scrolled ? 'via-brand-600' : 'via-white/40'} to-transparent transition-colors duration-300`}
      />

      <header className="fixed inset-x-0 top-[2px] z-40">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            scrolled
              ? 'bg-white/98 backdrop-blur-2xl border-b border-gray-200 shadow-md shadow-gray-100/80'
              : 'bg-transparent border-b border-white/10'
          }`}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center">
          {/* ── Logo ── */}
          {/* logo.png = versão clara (para hero escura) | logo-red.png = versão vermelha (para header branco) */}
          <a href="/" className="flex items-center flex-shrink-0 group">
            <Image
              src={scrolled ? '/logo-red.png' : '/logo.png'}
              alt="AngoPress"
              width={180}
              height={50}
              className="object-contain transition-all duration-300 group-hover:opacity-80"
              style={{ width: '15rem' }}
              priority
            />
          </a>

          {/* ── Nav links (desktop) — centered ── */}
          <nav className="absolute items-center hidden gap-1 -translate-x-1/2 lg:flex left-1/2">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={`px-4 py-2 text-[15px] font-semibold rounded-lg transition-all duration-150 tracking-[-0.01em] whitespace-nowrap ${
                  scrolled
                    ? 'text-gray-600 hover:text-brand-700 hover:bg-brand-50'
                    : 'text-white/85 hover:text-white hover:bg-white/12'
                }`}
              >
                {label}
              </a>
            ))}
            <JournalistRegisterModal
              variant="nav"
              navClassName={`px-4 py-2 text-[15px] font-semibold rounded-lg transition-all duration-150 tracking-[-0.01em] whitespace-nowrap ${
                scrolled
                  ? 'text-brand-600 hover:text-brand-700 hover:bg-brand-50'
                  : 'text-white/85 hover:text-white hover:bg-white/12'
              }`}
            />
          </nav>

          {/* ── Actions (desktop) ── */}
          <div className="items-center flex-shrink-0 hidden gap-3 ml-auto lg:flex">
            {/* Entrar — filled */}
            <a
              href={ASSESSOR_LOGIN_URL}
              className={`group inline-flex items-center gap-2 px-5 py-2.5 text-[13.5px] font-semibold rounded-xl transition-all duration-200 ${
                scrolled
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 hover:shadow-brand-600/35 hover:shadow-lg'
                  : 'bg-white text-brand-700 hover:bg-white/90 shadow-md shadow-black/20'
              }`}
            >
              Entrar
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

          {/* ── Hamburger (mobile) ── */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={`p-2 ml-auto transition-colors rounded-lg lg:hidden ${
              scrolled
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                : 'text-white hover:text-white/80 hover:bg-white/12'
            }`}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed inset-x-0 top-[68px] z-30 lg:hidden transition-all duration-300 origin-top ${
          mobileOpen
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="bg-white border-b border-gray-100 shadow-xl">
          <nav className="max-w-7xl mx-auto px-5 pt-3 pb-5 flex flex-col gap-0.5">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[14px] font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {label}
              </a>
            ))}

            <div className="h-px my-3 bg-gray-100" />

            <div className="flex flex-col gap-2">
              <JournalistRegisterModal
                variant="nav"
                navClassName="px-4 py-3 text-[14px] font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-colors tracking-[-0.01em] whitespace-nowrap text-left"
              />
              <a
                href={ASSESSOR_LOGIN_URL}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-colors shadow-md bg-brand-600 hover:bg-brand-700 rounded-xl shadow-brand-600/20"
              >
                Entrar como assessor
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
          </nav>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/10 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
