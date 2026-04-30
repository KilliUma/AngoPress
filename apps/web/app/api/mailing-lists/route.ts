import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/mailing-lists
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const lists = await prisma.mailingList.findMany({
      where: { userId: authUser.sub },
      include: { _count: { select: { contacts: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(lists)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/mailing-lists
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ message: 'Nome é obrigatório' }, { status: 400 })
    }

    const list = await prisma.mailingList.create({
      data: { name, description: description ?? null, userId: authUser.sub },
      include: { _count: { select: { contacts: true } } },
    })
    return NextResponse.json(list, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
