import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/analytics/campaigns/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { recipients: true } } },
    })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const [delivered, opened, clicked, bounced, complained] = await Promise.all([
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'DELIVERED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'OPENED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'CLICKED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'BOUNCED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'COMPLAINED' } }),
    ])

    const totalRecipients = campaign._count.recipients
    const openRate = totalRecipients > 0 ? (opened / totalRecipients) * 100 : 0
    const clickRate = totalRecipients > 0 ? (clicked / totalRecipients) * 100 : 0
    const bounceRate = totalRecipients > 0 ? (bounced / totalRecipients) * 100 : 0

    return NextResponse.json({
      campaignId: id,
      totalRecipients,
      delivered,
      opened,
      clicked,
      bounced,
      complained,
      openRate: parseFloat(openRate.toFixed(2)),
      clickRate: parseFloat(clickRate.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
