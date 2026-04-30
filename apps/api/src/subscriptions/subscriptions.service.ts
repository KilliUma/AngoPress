import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { SubscriptionStatus } from '@prisma/client'
import { RequestSubscriptionDto } from './dto/request-subscription.dto'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Planos ──────────────────────────────────────────────────────────────────

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } })
  }

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.subscriptionPlan.create({ data: dto })
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Plano não encontrado')
    return this.prisma.subscriptionPlan.update({ where: { id }, data: dto })
  }

  async deactivatePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('Plano não encontrado')
    await this.prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } })
    return { success: true }
  }

  // ─── Subscrição do utilizador ─────────────────────────────────────────────

  async getMySubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })
    if (!sub) return null
    const sendsRemaining = sub.plan ? Math.max(0, sub.plan.maxSendsMonth - sub.sendsUsed) : 0
    return { ...sub, sendsRemaining }
  }

  async requestSubscription(userId: string, dto: RequestSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } })
    if (!plan || !plan.isActive) throw new NotFoundException('Plano não encontrado ou inactivo')

    const existing = await this.prisma.subscription.findUnique({ where: { userId } })

    if (existing) {
      return this.prisma.subscription.update({
        where: { userId },
        data: { planId: dto.planId, status: SubscriptionStatus.PENDING },
        include: { plan: true },
      })
    }

    return this.prisma.subscription.create({
      data: { userId, planId: dto.planId, status: SubscriptionStatus.PENDING },
      include: { plan: true },
    })
  }

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } })
    if (!sub) throw new NotFoundException('Assinatura não encontrada')
    if (sub.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Assinatura já cancelada')
    }
    return this.prisma.subscription.update({
      where: { userId },
      data: { status: SubscriptionStatus.CANCELLED },
    })
  }
}
