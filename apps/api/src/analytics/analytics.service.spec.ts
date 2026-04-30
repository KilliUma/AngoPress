import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { PrismaService } from '@/prisma/prisma.service'
import { EmailEventType } from '@prisma/client'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  campaignRecipient: {
    findUnique: jest.fn(),
  },
  emailEvent: {
    findFirst: jest.fn(),
    create: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  campaign: {
    findUnique: jest.fn(),
  },
}

const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  let service: AnalyticsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
    jest.clearAllMocks()
  })

  // ─── trackOpen ───────────────────────────────────────────────────────────────

  describe('trackOpen', () => {
    it('deve registar abertura e retornar pixel GIF', async () => {
      mockPrisma.campaignRecipient.findUnique.mockResolvedValue({
        campaignId: 'camp-1',
        journalistId: 'j-1',
      })
      mockPrisma.emailEvent.findFirst.mockResolvedValue(null) // ainda não aberto
      mockPrisma.emailEvent.create.mockResolvedValue({})

      const result = await service.trackOpen('valid-token', '1.2.3.4')

      expect(result).toEqual(PIXEL_GIF)
      expect(mockPrisma.emailEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: EmailEventType.OPENED,
            campaignId: 'camp-1',
            journalistId: 'j-1',
          }),
        }),
      )
    })

    it('deve evitar duplicação de evento de abertura', async () => {
      mockPrisma.campaignRecipient.findUnique.mockResolvedValue({
        campaignId: 'camp-1',
        journalistId: 'j-1',
      })
      mockPrisma.emailEvent.findFirst.mockResolvedValue({ id: 'existing-event' }) // já aberto

      const result = await service.trackOpen('valid-token')

      expect(result).toEqual(PIXEL_GIF)
      expect(mockPrisma.emailEvent.create).not.toHaveBeenCalled()
    })

    it('deve retornar pixel mesmo com token inválido', async () => {
      mockPrisma.campaignRecipient.findUnique.mockResolvedValue(null)

      const result = await service.trackOpen('invalid-token')

      expect(result).toEqual(PIXEL_GIF)
      expect(mockPrisma.emailEvent.create).not.toHaveBeenCalled()
    })
  })

  // ─── trackClick ──────────────────────────────────────────────────────────────

  describe('trackClick', () => {
    it('deve registar clique e retornar URL de destino', async () => {
      const targetUrl = 'https://angopress.ao/comunicado'
      mockPrisma.campaignRecipient.findUnique.mockResolvedValue({
        campaignId: 'camp-1',
        journalistId: 'j-1',
      })
      mockPrisma.emailEvent.create.mockResolvedValue({})

      const result = await service.trackClick('valid-token', targetUrl, '1.2.3.4')

      expect(result).toBe(targetUrl)
      expect(mockPrisma.emailEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: EmailEventType.CLICKED,
            clickedUrl: targetUrl,
          }),
        }),
      )
    })

    it('deve retornar URL mesmo com token inválido', async () => {
      const targetUrl = 'https://angopress.ao'
      mockPrisma.campaignRecipient.findUnique.mockResolvedValue(null)

      const result = await service.trackClick('invalid-token', targetUrl)

      expect(result).toBe(targetUrl)
    })
  })

  // ─── getCampaignMetrics ───────────────────────────────────────────────────────

  describe('getCampaignMetrics', () => {
    it('deve lançar NotFoundException para campanha inexistente', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue(null)

      await expect(service.getCampaignMetrics('inexistente')).rejects.toThrow(NotFoundException)
    })

    it('deve retornar métricas com taxas calculadas', async () => {
      mockPrisma.campaign.findUnique.mockResolvedValue({
        id: 'camp-1',
        name: 'Campanha Teste',
        subject: 'Assunto',
        status: 'SENT',
        sentAt: new Date(),
        totalRecipients: 100,
      })
      mockPrisma.emailEvent.groupBy.mockResolvedValue([
        { eventType: 'DELIVERED', _count: { eventType: 95 } },
        { eventType: 'OPENED', _count: { eventType: 40 } },
        { eventType: 'CLICKED', _count: { eventType: 15 } },
        { eventType: 'BOUNCED', _count: { eventType: 5 } },
        { eventType: 'COMPLAINED', _count: { eventType: 1 } },
        { eventType: 'UNSUBSCRIBED', _count: { eventType: 2 } },
      ])

      const result = await service.getCampaignMetrics('camp-1')

      expect(result.metrics.delivered).toBe(95)
      expect(result.metrics.opened).toBe(40)
      expect(result.metrics.clicked).toBe(15)
      // taxas calculadas sobre totalRecipients (100)
      expect(result.metrics.openRate).toBeCloseTo(40, 0) // 40/100
      expect(result.metrics.clickRate).toBeCloseTo(15, 0) // 15/100
      expect(result.metrics.bounceRate).toBeCloseTo(5, 0) // 5/100
    })
  })
})
