import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken, signRefreshToken, buildAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshTokenCookie = request.cookies.get('refresh_token')?.value
    if (!refreshTokenCookie) {
      return NextResponse.json({ message: 'Refresh token não encontrado' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshTokenCookie)
    if (!payload) {
      return NextResponse.json({ message: 'Refresh token inválido' }, { status: 401 })
    }

    const stored = await prisma.refreshToken.findFirst({
      where: { token: refreshTokenCookie, revoked: false },
      include: { user: true },
    })

    if (!stored) {
      return NextResponse.json({ message: 'Refresh token inválido ou revogado' }, { status: 401 })
    }

    // Rotação — revogar o antigo
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

    const { user } = stored
    const newPayload = { sub: user.id, email: user.email, role: user.role }
    const [accessToken, newRefreshToken] = await Promise.all([
      signAccessToken(newPayload),
      signRefreshToken(newPayload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    })

    const cookies = buildAuthCookies(accessToken, newRefreshToken)
    const response = NextResponse.json({ ok: true })
    cookies.forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
