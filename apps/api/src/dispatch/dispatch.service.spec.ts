import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DispatchService } from './dispatch.service'
import { EmailService } from './email.service'
import { PrismaService } from '@/prisma/prisma.service'
import { CampaignStatus, SubscriptionStatus } from '@prisma/client'

// ─── Mock BullMQ ─────────────────────────────────────────────────────────────

jest.mock('bullmq', () => {
  const add = jest.fn().mockResolvedValue({ id: 'job-1' })
  const on = jest.fn()
  return {
    Queue: jest.fn().mockImplementation(() => ({ add, on })),
    Worker: jest.fn().mockImplementation(() => ({ on })),
  }
})

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  campaign: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
  },
  campaignRecipient: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  emailEvent: {
    create: jest.fn(),
  },
}

const mockEmailService = {
  sendEmail: jest.fn(),
}

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, unknown> = {
      'redis.host': 'localhost',
      'redis.port': 6379,
      'redis.password': undefined,
      'redis.tls': false,
      'app.url': 'http://localhost:3001',
    }
    return config[key]
  }),
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('DispatchService — checkQuota e enqueueCampaign', () => {
  let service: DispatchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<DispatchService>(DispatchService)
    jest.clearAllMocks()
  })

  // ─── enqueueCampaign ─────────────────────────────────────────────────────────

  describe('enqueueCampaign', () => {
    it('deve enfileirar campanha com quota suficiente', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'user-1',
        status: CampaignStatus.DRAFT,
        _count: { recipients: 10 },
      })
      mockPrisma.subscription.findUnique.mockResolvedValue({
        userId: 'user-1',
        status: SubscriptionStatus.ACTIVE,
        sendsUsed: 5,
        plan: { maxSendsMonth: 100 },
      })
      mockPrisma.campaign.update.mockResolvedValue({})

      await expect(service.enqueueCampaign('camp-1', 'user-1')).resolves.toBeUndefined()
      expect(mockPrisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'camp-1' },
        data: { status: CampaignStatus.QUEUED },
      })
    })

    it('deve lançar BadRequestException quando quota é insuficiente', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'user-1',
        status: CampaignStatus.DRAFT,
        _count: { recipients: 50 },
      })
      mockPrisma.subscription.findUnique.mockResolvedValue({
        userId: 'user-1',
        status: SubscriptionStatus.ACTIVE,
        sendsUsed: 80,
        plan: { maxSendsMonth: 100 },
      })

      await expect(service.enqueueCampaign('camp-1', 'user-1')).rejects.toThrow(BadRequestException)
      expect(mockPrisma.campaign.update).not.toHaveBeenCalled()
    })

    it('deve permitir envio sem subscrição (admin)', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'admin-1',
        status: CampaignStatus.DRAFT,
        _count: { recipients: 500 },
      })
      mockPrisma.subscription.findUnique.mockResolvedValue(null) // admin sem subscrição
      mockPrisma.campaign.update.mockResolvedValue({})

      await expect(service.enqueueCampaign('camp-1', 'admin-1')).resolves.toBeUndefined()
    })

    it('deve lançar NotFoundException para campanha inexistente', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue(null)

      await expect(service.enqueueCampaign('inexistente', 'user-1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('deve lançar ForbiddenException para utilizador que não é dono', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'outro-user',
        status: CampaignStatus.DRAFT,
        _count: { recipients: 10 },
      })

      await expect(service.enqueueCampaign('camp-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })

    it('deve lançar BadRequestException para campanha já enviada', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'user-1',
        status: CampaignStatus.SENT,
        _count: { recipients: 10 },
      })

      await expect(service.enqueueCampaign('camp-1', 'user-1')).rejects.toThrow(BadRequestException)
    })
  })

  // ─── scheduleCampaign ────────────────────────────────────────────────────────

  describe('scheduleCampaign', () => {
    it('deve lançar BadRequestException para data no passado', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'user-1',
        status: CampaignStatus.DRAFT,
      })

      const pastDate = new Date(Date.now() - 60000)
      await expect(service.scheduleCampaign('camp-1', 'user-1', pastDate)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('deve agendar campanha para data futura', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        userId: 'user-1',
        status: CampaignStatus.DRAFT,
      })
      mockPrisma.campaign.update.mockResolvedValue({})

      const futureDate = new Date(Date.now() + 3600000)
      await expect(
        service.scheduleCampaign('camp-1', 'user-1', futureDate),
      ).resolves.toBeUndefined()
    })
  })
})
