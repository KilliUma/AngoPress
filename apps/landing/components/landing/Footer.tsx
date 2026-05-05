import Image from 'next/image'
import { JournalistRegisterModal } from '@/components/JournalistRegisterModal'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.angopress.ao'

const PLATAFORMA_LINKS = [
  ['Sobre', '#sobre'],
  ['Como funciona', '#como-funciona'],
  ['Funcionalidades', '#como-funciona'],
  ['Planos e Preços', '#precos'],
  ['Criar conta', `${APP_URL}/cadastro`],
  ['Entrar', `${APP_URL}/login`],
]

const LEGAL_LINKS = [
  ['Política de Privacidade', '/privacidade'],
  ['Termos de Uso', '/termos'],
  ['Política Anti-spam', '/anti-spam'],
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-900">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center mb-4 w-fit group">
              <Image
                src="/logo-white.png"
                alt="AngoPress"
                width={140}
                height={40}
                className="h-8 w-auto object-contain transition-opacity duration-200 group-hover:opacity-75"
              />
            </a>
            <p className="text-sm text-brand-200/50 leading-relaxed mb-5 max-w-xs">
              Plataforma Digital de Comunicação e Mailing de Imprensa. Conectando marcas e
              jornalistas em Angola.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4">
              Plataforma
            </p>
            <ul className="space-y-2.5">
              {PLATAFORMA_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-brand-200/60 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Para Jornalistas + Legal */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4">
                Para Jornalistas
              </p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href={`${APP_URL}/cadastro-jornalista`}
                    className="text-sm text-brand-200/60 hover:text-white transition-colors duration-150"
                  >
                    Registar-se
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4">
                Legal
              </p>
              <ul className="space-y-2.5">
                {LEGAL_LINKS.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-brand-200/60 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-200/40">
            © {new Date().getFullYear()} AngoPress. Todos os direitos reservados.
          </p>
          <p className="text-xs text-brand-200/40">Feito em Angola 🇦🇴</p>
        </div>
      </div>
    </footer>
  )
}
