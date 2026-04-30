import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// POST /api/campaigns/[id]/schedule
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.userId !== authUser.sub)
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const { scheduledAt } = body

    if (!scheduledAt) {
      return NextResponse.json({ message: 'scheduledAt é obrigatório' }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate.getTime() < Date.now()) {
      return NextResponse.json({ message: 'Data de agendamento no passado' }, { status: 400 })
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: 'SCHEDULED', scheduledAt: scheduledDate },
    })

    return NextResponse.json(updated, { status: 202 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
