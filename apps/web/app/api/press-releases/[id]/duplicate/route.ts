import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const pr = await prisma.pressRelease.findUnique({ where: { id } })
    if (!pr) return NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 })
    if (pr.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const copy = await prisma.pressRelease.create({
      data: {
        title: `Cópia — ${pr.title}`,
        content: pr.content,
        summary: pr.summary,
        status: 'DRAFT',
        userId: authUser.sub,
      },
      include: { attachments: true },
    })
    return NextResponse.json(copy, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
