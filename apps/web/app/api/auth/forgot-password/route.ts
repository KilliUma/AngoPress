import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return new NextResponse(null, { status: 204 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    })
    // Não revelar se o email existe
    if (!user) return new NextResponse(null, { status: 204 })

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })

    // TODO: Enviar email via SES com o link de reset
    console.log(`[DEV] Token de reset para ${user.email}: ${token}`)

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
