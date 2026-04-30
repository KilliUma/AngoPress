import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/journalists/registrations — público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, outlet, mediaType, jobTitle, city, message } = body

    if (!name || !email || !outlet || !mediaType) {
      return NextResponse.json({ message: 'Campos obrigatórios em falta' }, { status: 400 })
    }

    const duplicate = await prisma.journalistRegistration.findFirst({
      where: { email: email.toLowerCase(), status: 'PENDING' },
    })
    if (duplicate) {
      return NextResponse.json(
        { message: 'Já existe um pedido pendente para este e-mail.' },
        { status: 409 },
      )
    }

    const reg = await prisma.journalistRegistration.create({
      data: {
        name,
        email: email.toLowerCase(),
        outlet,
        mediaType,
        jobTitle: jobTitle ?? null,
        city: city ?? null,
        message: message ?? null,
      },
    })

    return NextResponse.json(reg, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
