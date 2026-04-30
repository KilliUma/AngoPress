import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/campaigns/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        pressRelease: { select: { id: true, title: true, content: true, summary: true } },
        recipients: {
          include: { journalist: { select: { id: true, name: true, email: true, outlet: true } } },
          orderBy: { journalist: { name: 'asc' } },
        },
        _count: { select: { recipients: true, emailEvents: true } },
      },
    })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (authUser.role !== 'ADMIN' && campaign.userId !== authUser.sub) {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }
    return NextResponse.json(campaign)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/campaigns/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (authUser.role !== 'ADMIN' && campaign.userId !== authUser.sub) {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }
    if (campaign.status === 'SENDING') {
      return NextResponse.json(
        { message: 'Não é possível eliminar uma campanha em envio' },
        { status: 400 },
      )
    }

    await prisma.campaign.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
