'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.angopress.ao'

const PLATAFORMA_LINKS = [
  ['Sobre', '#sobre'],
  ['Como funciona', '#como-funciona'],
  ['Funcionalidades', '#como-funciona'],
  ['Planos e Preços', '#precos'],
  ['Criar conta', 'https://angopress.vercel.app/login'],
  ['Entrar', 'https://angopress.vercel.app/login'],
]

const JORNALISTAS_LINKS = [
  ['Registar-se', 'https://angopress.vercel.app/login'],
  ['Como funciona', '#como-funciona'],
]

const LEGAL_LINKS = [
  ['Política de Privacidade', '/privacidade'],
  ['Termos de Uso', '/termos'],
  ['Política Anti-spam', '/anti-spam'],
]

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/angopress',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/angopress',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/angopress',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
]

function FooterLinkGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-white uppercase tracking-widest mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="group inline-flex items-center gap-1.5 text-sm text-brand-200/80 hover:text-white transition-colors duration-200"
            >
              <svg
                viewBox="0 0 6 10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-2 h-2 transition-all duration-200 -translate-x-1 opacity-0 text-brand-500 group-hover:opacity-100 group-hover:translate-x-0 shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m1 1 4 4-4 4" />
              </svg>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04L10.75 5.612V16.25A.75.75 0 0 1 10 17Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

export function Footer() {
  return (
    <>
      <BackToTop />
      <footer className="relative overflow-hidden bg-brand-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

        {/* Decorative radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-brand-700/10 blur-[130px]"
        />

        {/* Main content */}
        <div className="relative max-w-6xl px-4 mx-auto sm:px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4">
              <a href="/" className="inline-flex items-center mb-5 group">
                <Image
                  src="/logo-white.png"
                  alt="AngoPress"
                  width={140}
                  height={40}
                  className="object-contain w-auto transition-opacity duration-200 h-19 opacity-90 group-hover:opacity-100"
                />
              </a>
              <p className="text-sm text-brand-200/70 leading-relaxed mb-6 max-w-[260px]">
                Plataforma Digital de Comunicação e Mailing de Imprensa. Conectando marcas e
                jornalistas em Angola.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-lg bg-white/5 hover:bg-brand-600 text-brand-200/50 hover:text-white"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            <div className="grid grid-cols-2 col-span-2 gap-8 md:col-span-8 sm:grid-cols-3">
              <FooterLinkGroup title="Plataforma" links={PLATAFORMA_LINKS} />
              <FooterLinkGroup title="Para Jornalistas" links={JORNALISTAS_LINKS} />
              <FooterLinkGroup title="Legal" links={LEGAL_LINKS} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 pt-6 mt-12 text-xs border-t border-white/5 sm:flex-row text-white/80">
            <p>© {new Date().getFullYear()} AngoPress. Todos os direitos reservados.</p>

            <a
              href="https://outisux.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-white"
            >
              Design by{' '}
              <span className="font-semibold text-white transition-colors duration-200 hover:text-white">
                Outis UX
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
