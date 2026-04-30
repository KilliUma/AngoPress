'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

// Mapeamento de segmentos para rótulos legíveis
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  jornalistas: 'Jornalistas',
  listas: 'Listas de Envio',
  'press-releases': 'Press Releases',
  campanhas: 'Campanhas',
  analytics: 'Analytics',
  assinatura: 'Assinatura',
  perfil: 'Perfil',
  admin: 'Administração',
  novo: 'Novo',
  editar: 'Editar',
}

function getLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Quebrar pathname em segmentos (ignorar vazios)
  const segments = pathname.split('/').filter(Boolean)

  // Não mostrar breadcrumbs na raiz do dashboard
  if (segments.length <= 1) return null

  // Construir crumbs
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    // IDs (cuid format: começa com letra, tem 24+ chars) — mostrar como "Detalhes"
    const label = /^c[a-z0-9]{20,}$/.test(segment) ? 'Detalhes' : getLabel(segment)
    return { label, href, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="text-neutral-400 hover:text-neutral-700 transition-colors"
        aria-label="Início"
      >
        <Home size={14} />
      </Link>
      {crumbs.map(({ label, href, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-neutral-300 shrink-0" />
          {isLast ? (
            <span className="font-medium text-neutral-700">{label}</span>
          ) : (
            <Link href={href} className="text-neutral-400 hover:text-neutral-700 transition-colors">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
