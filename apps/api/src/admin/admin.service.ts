import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  UserStatus,
  UserRole,
  SubscriptionStatus,
  JournalistRegistrationStatus,
  Prisma,
} from '@prisma/client'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { AdminActivateSubscriptionDto } from './dto/activate-subscription.dto'
import { ReviewRegistrationDto } from './dto/review-registration.dto'
import { MailService } from '@/mail/mail.service'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ─── Estatísticas globais ──────────────────────────────────────────────────

  async getStats() {
    const [
      totalUsers,
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalJournalists,
      totalPressReleases,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.CLIENT } }),
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.PENDING } }),
      this.prisma.campaign.count({ where: { status: 'SENT' } }),
      this.prisma.journalist.count(),
      this.prisma.pressRelease.count(),
    ])

    return {
      totalUsers,
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalJournalists,
      totalPressReleases,
    }
  }

  async getPublicStats() {
    const [totalJournalists, totalCampaignsSent, activeCompanies, recentJournalists] =
      await Promise.all([
        this.prisma.journalist.count({ where: { isActive: true } }),
        this.prisma.campaign.count({ where: { status: 'SENT' } }),
        this.prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
        this.prisma.journalist.findMany({
          where: { isActive: true },
          select: { name: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])
    const journalistInitials = recentJournalists.map((j) => j.name.trim().charAt(0).toUpperCase())
    return { totalJournalists, totalCampaignsSent, activeCompanies, journalistInitials }
  }

  // ─── Utilizadores ─────────────────────────────────────────────────────────

  async getUsers(query: {
    search?: string
    role?: UserRole
    status?: UserStatus
    page?: number
    limit?: number
  }) {
    const { search, role, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) where.role = role
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          company: true,
          createdAt: true,
          subscription: {
            select: {
              id: true,
              status: true,
              expiresAt: true,
              sendsUsed: true,
              plan: { select: { id: true, name: true, maxSendsMonth: true } },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Utilizador não encontrado')
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
      select: { id: true, name: true, email: true, status: true, role: true },
    })
  }

  // ─── Assinaturas ──────────────────────────────────────────────────────────

  async getSubscriptions(query: { status?: SubscriptionStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.SubscriptionWhereInput = {}
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          user: { select: { id: true, name: true, email: true, company: true } },
          plan: { select: { id: true, name: true, priceMonthlyAoa: true, maxSendsMonth: true } },
        },
      }),
      this.prisma.subscription.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async activateSubscription(userId: string, dto: AdminActivateSubscriptionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })
    if (!user) throw new NotFoundException('Utilizador não encontrado')

    const now = new Date()
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    // Activar o utilizador se ainda estiver pendente
    if (user.status === UserStatus.PENDING) {
      await this.prisma.user.update({ where: { id: userId }, data: { status: UserStatus.ACTIVE } })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any

    if (user.subscription) {
      result = await this.prisma.subscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          activatedAt: now,
          expiresAt,
          periodStart: now,
          periodEnd: expiresAt,
          sendsUsed: 0,
          ...(dto.planId && { planId: dto.planId }),
          ...(dto.adminNotes !== undefined && { adminNotes: dto.adminNotes }),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: true,
        },
      })
    } else {
      if (!dto.planId) {
        throw new NotFoundException('planId é obrigatório para criar uma nova subscrição')
      }

      result = await this.prisma.subscription.create({
        data: {
          userId,
          planId: dto.planId,
          status: SubscriptionStatus.ACTIVE,
          activatedAt: now,
          expiresAt,
          periodStart: now,
          periodEnd: expiresAt,
          ...(dto.adminNotes && { adminNotes: dto.adminNotes }),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          plan: true,
        },
      })
    }

    // Enviar email de notificação ao utilizador
    void this.mail.sendSubscriptionActivated({
      toEmail: result.user.email,
      toName: result.user.name,
      planName: result.plan.name,
      expiresAt,
      sendsPerMonth: result.plan.maxSendsMonth,
    })

    return result
  }

  // ─── Planos ────────────────────────────────────────────────────────────────

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } })
  }

  async createPlan(dto: Prisma.SubscriptionPlanCreateInput) {
    return this.prisma.subscriptionPlan.create({ data: dto })
  }

  async updatePlan(id: string, dto: Prisma.SubscriptionPlanUpdateInput) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Plano não encontrado')
    return this.prisma.subscriptionPlan.update({ where: { id }, data: dto })
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Plano não encontrado')
    await this.prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } })
    return { success: true }
  }

  // ─── Registos de jornalistas ──────────────────────────────────────────────

  async getJournalistRegistrations(query: {
    status?: JournalistRegistrationStatus
    page?: number
    limit?: number
  }) {
    const { status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.JournalistRegistrationWhereInput = {}
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.journalistRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.journalistRegistration.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getAdminNotifications() {
    const [pendingSubscriptions, pendingJournalistRegistrations] = await Promise.all([
      this.prisma.subscription.count({ where: { status: SubscriptionStatus.PENDING } }),
      this.prisma.journalistRegistration.count({
        where: { status: JournalistRegistrationStatus.PENDING },
      }),
    ])
    return { pendingSubscriptions, pendingJournalistRegistrations }
  }

  async reviewJournalistRegistration(id: string, dto: ReviewRegistrationDto, reviewedBy: string) {
    const reg = await this.prisma.journalistRegistration.findUnique({ where: { id } })
    if (!reg) throw new NotFoundException('Registo não encontrado')

    if (dto.status === JournalistRegistrationStatus.APPROVED) {
      const existing = await this.prisma.journalist.findUnique({ where: { email: reg.email } })
      if (!existing) {
        await this.prisma.journalist.create({
          data: {
            name: reg.name,
            email: reg.email,
            outlet: reg.outlet,
            jobTitle: reg.jobTitle,
            mediaType: reg.mediaType,
          },
        })
      }
    }

    return this.prisma.journalistRegistration.update({
      where: { id },
      data: { status: dto.status, reviewedBy, reviewedAt: new Date() },
    })
  }
}
