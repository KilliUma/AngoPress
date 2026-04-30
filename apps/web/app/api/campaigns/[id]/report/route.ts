import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/campaigns/[id]/report — alias semântico do endpoint de analytics
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: { select: { recipients: true } },
        pressRelease: { select: { id: true, title: true } },
      },
    })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const [delivered, opened, clicked, bounced, complained, failed, optedOut] = await Promise.all([
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'DELIVERED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'OPENED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'CLICKED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'BOUNCED' } }),
      prisma.emailEvent.count({ where: { campaignId: id, eventType: 'COMPLAINED' } }),
      prisma.campaignRecipient.count({ where: { campaignId: id, status: 'FAILED' } }),
      prisma.campaignRecipient.count({ where: { campaignId: id, status: 'OPTED_OUT' } }),
    ])

    const totalRecipients = campaign._count.recipients
    const calc = (n: number) =>
      parseFloat(totalRecipients > 0 ? ((n / totalRecipients) * 100).toFixed(2) : '0')

    return NextResponse.json({
      campaignId: id,
      campaignName: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      sentAt: campaign.sentAt,
      pressRelease: campaign.pressRelease,
      totalRecipients,
      delivered,
      opened,
      clicked,
      bounced,
      complained,
      failed,
      optedOut,
      openRate: calc(opened),
      clickRate: calc(clicked),
      bounceRate: calc(bounced),
      deliveryRate: calc(delivered),
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
