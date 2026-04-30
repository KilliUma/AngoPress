import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// POST /api/mailing-lists/[id]/contacts — adicionar jornalistas
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const list = await prisma.mailingList.findUnique({ where: { id } })
    if (!list) return NextResponse.json({ message: 'Lista não encontrada' }, { status: 404 })
    if (list.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { journalistIds } = body

    if (!Array.isArray(journalistIds) || journalistIds.length === 0) {
      return NextResponse.json({ message: 'journalistIds é obrigatório' }, { status: 400 })
    }

    await prisma.mailingListContact.createMany({
      data: journalistIds.map((journalistId: string) => ({ listId: id, journalistId })),
      skipDuplicates: true,
    })

    const updated = await prisma.mailingList.findUnique({
      where: { id },
      include: {
        contacts: { include: { journalist: true }, orderBy: { addedAt: 'desc' } },
        _count: { select: { contacts: true } },
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
