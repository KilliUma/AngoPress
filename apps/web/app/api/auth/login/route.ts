import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, buildAuthCookies } from '@/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e password são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
      // Verificar jornalista com pedido pendente
      const reg = await prisma.journalistRegistration.findFirst({
        where: { email: email.toLowerCase() },
        orderBy: { createdAt: 'desc' },
      })
      if (reg?.status === 'PENDING') {
        return NextResponse.json(
          {
            message:
              'O seu pedido de cadastro como jornalista está em análise. Receberá uma notificação quando for aprovado.',
          },
          { status: 401 },
        )
      }
      if (reg?.status === 'REJECTED') {
        return NextResponse.json(
          {
            message:
              'O seu pedido de cadastro como jornalista foi rejeitado. Contacte o suporte para mais informações.',
          },
          { status: 401 },
        )
      }
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json({ message: 'Conta inactiva. Contacte o suporte.' }, { status: 401 })
    }
    if (user.status === 'PENDING') {
      return NextResponse.json(
        { message: 'A sua conta está pendente de activação. Contacte o suporte.' },
        { status: 401 },
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    const payload = { sub: user.id, email: user.email, role: user.role }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    const cookies = buildAuthCookies(accessToken, refreshToken)
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company: user.company,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    })
    cookies.forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
