import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-min-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
)

// ---------------------------------------------------------------------------
// Rate limiting simples (sliding window, por instância Edge)
// Suficiente para proteger contra ataques básicos em endpoints de auth.
// ---------------------------------------------------------------------------
interface RateWindow {
  timestamps: number[]
}
const rateLimitStore = new Map<string, RateWindow>()

const RATE_LIMIT_RULES: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login': { limit: 10, windowMs: 60_000 },
  '/api/auth/register': { limit: 5, windowMs: 60_000 },
  '/api/auth/forgot-password': { limit: 3, windowMs: 60_000 },
  '/api/auth/reset-password': { limit: 5, windowMs: 60_000 },
}

function isRateLimited(ip: string, pathname: string): boolean {
  const rule = RATE_LIMIT_RULES[pathname]
  if (!rule) return false

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = rateLimitStore.get(key) ?? { timestamps: [] }

  // Limpar timestamps fora da janela
  entry.timestamps = entry.timestamps.filter((t) => now - t < rule.windowMs)

  if (entry.timestamps.length >= rule.limit) {
    rateLimitStore.set(key, entry)
    return true
  }

  entry.timestamps.push(now)
  rateLimitStore.set(key, entry)
  return false
}

const PROTECTED = [
  '/dashboard',
  '/press-releases',
  '/campanhas',
  '/analytics',
  '/assinatura',
  '/perfil',
]
const ADMIN_ONLY = ['/admin', '/jornalistas', '/listas']
const AUTH_PAGES = ['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Rate limiting para endpoints de auth
  if (request.method === 'POST' && pathname in RATE_LIMIT_RULES) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    if (isRateLimited(ip, pathname)) {
      return NextResponse.json(
        { message: 'Demasiadas tentativas. Tente novamente mais tarde.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
  }

  const isProtected =
    PROTECTED.some((p) => pathname.startsWith(p)) || ADMIN_ONLY.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && payload.role !== 'ADMIN') {
        // Clientes que tentam aceder a rotas admin → redireccionados para o seu dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isAuthPage && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      // Redireccionamento pós-login por role
      const dest = payload.role === 'ADMIN' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    } catch {
      // token inválido, continua para página de auth
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Proteger páginas do dashboard
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
