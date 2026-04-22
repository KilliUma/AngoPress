import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { UserRole, CampaignStatus } from '@prisma/client'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { QueryCampaignDto } from './dto/query-campaign.dto'

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole, query: QueryCampaignDto) {
    const { search, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (userRole !== UserRole.ADMIN) where.userId = userId
    if (status) where.status = status
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pressRelease: { select: { id: true, title: true } },
          _count: { select: { recipients: true, emailEvents: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const campaign = await this.prisma.campaign.findUnique({
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
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    if (userRole !== UserRole.ADMIN && campaign.userId !== userId) throw new ForbiddenException()
    return campaign
  }

  async create(dto: CreateCampaignDto, userId: string) {
    const {
      pressReleaseId,
      name,
      subject,
      journalistIds = [],
      mailingListIds = [],
      scheduledAt,
    } = dto

    // Verificar press release
    const pr = await this.prisma.pressRelease.findFirst({
      where: { id: pressReleaseId, userId },
    })
    if (!pr) throw new NotFoundException('Press release não encontrado')

    // Resolver jornalistas únicos a partir de IDs directos + listas
    const allJournalistIds = new Set(journalistIds)

    if (mailingListIds.length) {
      const listContacts = await this.prisma.mailingListContact.findMany({
        where: { listId: { in: mailingListIds } },
        select: { journalistId: true },
      })
      listContacts.forEach((c) => allJournalistIds.add(c.journalistId))
    }

    if (allJournalistIds.size === 0)
      throw new BadRequestException('A campanha precisa de pelo menos um destinatário')

    // Filtrar jornalistas activos e sem opt-out
    const validJournalists = await this.prisma.journalist.findMany({
      where: { id: { in: [...allJournalistIds] }, isActive: true, isOptedOut: false },
      select: { id: true },
    })

    if (validJournalists.length === 0)
      throw new BadRequestException('Nenhum destinatário válido (activo e sem opt-out)')

    // Criar campanha + destinatários atomicamente
    const campaign = await this.prisma.campaign.create({
      data: {
        userId,
        pressReleaseId,
        name,
        subject,
        status: scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalRecipients: validJournalists.length,
        recipients: {
          create: validJournalists.map((j) => ({ journalistId: j.id })),
        },
      },
      include: {
        pressRelease: { select: { id: true, title: true } },
        _count: { select: { recipients: true } },
      },
    })

    return campaign
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    if (userRole !== UserRole.ADMIN && campaign.userId !== userId) throw new ForbiddenException()
    if (campaign.status === CampaignStatus.SENDING)
      throw new BadRequestException('Não é possível eliminar uma campanha em envio')
    await this.prisma.campaign.delete({ where: { id } })
  }

  async getReport(id: string, userId: string, userRole: UserRole) {
    const campaign = await this.findOne(id, userId, userRole)

    // Agregar eventos por tipo
    const eventCounts = await this.prisma.emailEvent.groupBy({
      by: ['eventType'],
      where: { campaignId: id },
      _count: { eventType: true },
    })

    const countsMap = Object.fromEntries(eventCounts.map((e) => [e.eventType, e._count.eventType]))

    // Eventos por jornalista
    const eventsPerJournalist = await this.prisma.emailEvent.findMany({
      where: { campaignId: id },
      include: { journalist: { select: { id: true, name: true, email: true, outlet: true } } },
      orderBy: { occurredAt: 'desc' },
    })

    const total = campaign.totalRecipients
    const delivered = countsMap['DELIVERED'] ?? 0
    const opened = countsMap['OPENED'] ?? 0
    const clicked = countsMap['CLICKED'] ?? 0
    const bounced = countsMap['BOUNCED'] ?? 0
    const unsubscribed = countsMap['UNSUBSCRIBED'] ?? 0

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentAt: campaign.sentAt,
        totalRecipients: total,
      },
      metrics: {
        delivered,
        opened,
        clicked,
        bounced,
        unsubscribed,
        openRate: total > 0 ? +((opened / total) * 100).toFixed(1) : 0,
        clickRate: total > 0 ? +((clicked / total) * 100).toFixed(1) : 0,
        bounceRate: total > 0 ? +((bounced / total) * 100).toFixed(1) : 0,
      },
      events: eventsPerJournalist,
    }
  }
}
