import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { EmailEventType } from '@prisma/client'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Regista abertura via tracking token de CampaignRecipient.
   * Retorna imagem GIF 1x1 transparente.
   */
  async trackOpen(token: string, ip?: string, userAgent?: string): Promise<Buffer> {
    try {
      const recipient = await this.prisma.campaignRecipient.findUnique({
        where: { trackingToken: token },
        select: { campaignId: true, journalistId: true },
      })

      if (recipient) {
        // Evitar duplicação — registar apenas uma abertura por token
        const already = await this.prisma.emailEvent.findFirst({
          where: {
            campaignId: recipient.campaignId,
            journalistId: recipient.journalistId,
            eventType: EmailEventType.OPENED,
          },
        })
        if (!already) {
          await this.prisma.emailEvent.create({
            data: {
              campaignId: recipient.campaignId,
              journalistId: recipient.journalistId,
              eventType: EmailEventType.OPENED,
              ipAddress: ip,
              userAgent,
            },
          })
        }
      }
    } catch (err) {
      this.logger.warn(`trackOpen falhou para token ${token}: ${(err as Error).message}`)
    }

    // GIF 1×1 transparente
    return Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  }

  /**
   * Regista clique e redireciona.
   */
  async trackClick(token: string, url: string, ip?: string, userAgent?: string): Promise<string> {
    try {
      const recipient = await this.prisma.campaignRecipient.findUnique({
        where: { trackingToken: token },
        select: { campaignId: true, journalistId: true },
      })

      if (recipient && url) {
        await this.prisma.emailEvent.create({
          data: {
            campaignId: recipient.campaignId,
            journalistId: recipient.journalistId,
            eventType: EmailEventType.CLICKED,
            clickedUrl: url,
            ipAddress: ip,
            userAgent,
          },
        })
      }
    } catch (err) {
      this.logger.warn(`trackClick falhou para token ${token}: ${(err as Error).message}`)
    }

    return url
  }

  /** Métricas agregadas de uma campanha */
  async getCampaignMetrics(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        sentAt: true,
        totalRecipients: true,
      },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')

    const eventCounts = await this.prisma.emailEvent.groupBy({
      by: ['eventType'],
      where: { campaignId },
      _count: { eventType: true },
    })

    const counts = Object.fromEntries(eventCounts.map((e) => [e.eventType, e._count.eventType]))
    const total = campaign.totalRecipients

    return {
      ...campaign,
      metrics: {
        delivered: counts['DELIVERED'] ?? 0,
        opened: counts['OPENED'] ?? 0,
        clicked: counts['CLICKED'] ?? 0,
        bounced: counts['BOUNCED'] ?? 0,
        complained: counts['COMPLAINED'] ?? 0,
        unsubscribed: counts['UNSUBSCRIBED'] ?? 0,
        openRate: total > 0 ? +(((counts['OPENED'] ?? 0) / total) * 100).toFixed(1) : 0,
        clickRate: total > 0 ? +(((counts['CLICKED'] ?? 0) / total) * 100).toFixed(1) : 0,
        bounceRate: total > 0 ? +(((counts['BOUNCED'] ?? 0) / total) * 100).toFixed(1) : 0,
      },
    }
  }

  /** Lista de eventos individuais (jornalista × tipo) para relatório */
  async getCampaignEvents(campaignId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [events, total] = await Promise.all([
      this.prisma.emailEvent.findMany({
        where: { campaignId },
        include: { journalist: { select: { id: true, name: true, email: true, outlet: true } } },
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailEvent.count({ where: { campaignId } }),
    ])
    return { data: events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }
}
