import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, buildAuthCookies } from '@/lib/auth'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12
const REGISTER_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  company: true,
  phone: true,
  avatarUrl: true,
  createdAt: true,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, company } = body

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Campos obrigatórios em falta' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ message: 'Este email já está em uso' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        company: company ?? null,
        role: 'CLIENT',
        status: 'ACTIVE',
      },
      select: REGISTER_USER_SELECT,
    })

    const payload = { sub: user.id, email: user.email, role: user.role }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload),
    ])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

    const cookies = buildAuthCookies(accessToken, refreshToken)
    const response = NextResponse.json(
      {
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
      },
      { status: 201 },
    )
    cookies.forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  } catch (error) {
    console.error('[POST /api/auth/register]', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    })
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
