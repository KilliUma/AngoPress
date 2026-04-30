import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { PrismaService } from '@/prisma/prisma.service'
import { SubscriptionStatus } from '@prisma/client'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  subscriptionPlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}

const basePlan = {
  id: 'plan-1',
  name: 'Básico',
  description: 'Plano básico',
  maxSendsMonth: 100,
  features: ['Envio de press releases'],
  priceMonthlyAoa: 5000,
  priceYearlyAoa: null,
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const baseSubscription = {
  id: 'sub-1',
  userId: 'user-1',
  planId: 'plan-1',
  status: SubscriptionStatus.ACTIVE,
  activatedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 3600000),
  sendsUsed: 10,
  periodStart: new Date(),
  periodEnd: new Date(),
  adminNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  plan: basePlan,
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('SubscriptionsService', () => {
  let service: SubscriptionsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()

    service = module.get<SubscriptionsService>(SubscriptionsService)
    jest.clearAllMocks()
  })

  // ─── getMySubscription ───────────────────────────────────────────────────────

  describe('getMySubscription', () => {
    it('deve retornar null quando não há assinatura', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null)

      const result = await service.getMySubscription('user-1')

      expect(result).toBeNull()
    })

    it('deve calcular sendsRemaining correctamente', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(baseSubscription)

      const result = await service.getMySubscription('user-1')

      expect(result!.sendsRemaining).toBe(90) // 100 - 10
    })

    it('deve retornar 0 para enviados quando excede o máximo', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        ...baseSubscription,
        sendsUsed: 120,
      })

      const result = await service.getMySubscription('user-1')

      expect(result!.sendsRemaining).toBe(0)
    })
  })

  // ─── requestSubscription ─────────────────────────────────────────────────────

  describe('requestSubscription', () => {
    it('deve criar nova assinatura PENDING', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(basePlan)
      mockPrisma.subscription.findUnique.mockResolvedValue(null)
      mockPrisma.subscription.create.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.PENDING,
      })

      const result = await service.requestSubscription('user-1', { planId: 'plan-1' })

      expect(result.status).toBe(SubscriptionStatus.PENDING)
      expect(mockPrisma.subscription.create).toHaveBeenCalledTimes(1)
    })

    it('deve actualizar assinatura existente expirada/cancelada', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(basePlan)
      mockPrisma.subscription.findUnique.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.EXPIRED,
      })
      mockPrisma.subscription.update.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.PENDING,
      })

      await service.requestSubscription('user-1', { planId: 'plan-1' })

      expect(mockPrisma.subscription.update).toHaveBeenCalledTimes(1)
      expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
    })

    it('deve lançar ConflictException para assinatura já activa', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(basePlan)
      mockPrisma.subscription.findUnique.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.ACTIVE,
      })

      await expect(service.requestSubscription('user-1', { planId: 'plan-1' })).rejects.toThrow(
        ConflictException,
      )
    })

    it('deve lançar NotFoundException para plano inactivo', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue({
        ...basePlan,
        isActive: false,
      })

      await expect(service.requestSubscription('user-1', { planId: 'plan-1' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('deve lançar NotFoundException para plano inexistente', async () => {
      mockPrisma.subscriptionPlan.findUnique.mockResolvedValue(null)

      await expect(
        service.requestSubscription('user-1', { planId: 'inexistente' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  // ─── cancelSubscription ──────────────────────────────────────────────────────

  describe('cancelSubscription', () => {
    it('deve cancelar assinatura activa', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(baseSubscription)
      mockPrisma.subscription.update.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.CANCELLED,
      })

      const result = await service.cancelSubscription('user-1')

      expect(result.status).toBe(SubscriptionStatus.CANCELLED)
    })

    it('deve lançar NotFoundException sem assinatura', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null)

      await expect(service.cancelSubscription('user-1')).rejects.toThrow(NotFoundException)
    })

    it('deve lançar BadRequestException para assinatura já cancelada', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        ...baseSubscription,
        status: SubscriptionStatus.CANCELLED,
      })

      await expect(service.cancelSubscription('user-1')).rejects.toThrow(BadRequestException)
    })
  })
})
