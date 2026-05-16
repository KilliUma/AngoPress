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

    const [deliveredEvents, sentRecipients, opened, clicked, bounced, complained, unsubscribed] =
      await Promise.all([
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'DELIVERED' } }),
        prisma.campaignRecipient.count({
          where: { campaignId: id, status: { in: ['SENT', 'DELIVERED'] } },
        }),
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'OPENED' } }),
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'CLICKED' } }),
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'BOUNCED' } }),
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'COMPLAINED' } }),
        prisma.emailEvent.count({ where: { campaignId: id, eventType: 'UNSUBSCRIBED' } }),
      ])

    const totalRecipients = campaign._count.recipients
    const delivered = deliveredEvents > 0 ? deliveredEvents : sentRecipients
    const openRate = totalRecipients > 0 ? opened / totalRecipients : 0
    const clickRate = totalRecipients > 0 ? clicked / totalRecipients : 0
    const bounceRate = totalRecipients > 0 ? bounced / totalRecipients : 0

    return NextResponse.json({
      id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      sentAt: campaign.sentAt,
      totalRecipients,
      metrics: {
        delivered,
        opened,
        clicked,
        bounced,
        complained,
        unsubscribed,
        openRate: parseFloat(openRate.toFixed(4)),
        clickRate: parseFloat(clickRate.toFixed(4)),
        bounceRate: parseFloat(bounceRate.toFixed(4)),
      },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
