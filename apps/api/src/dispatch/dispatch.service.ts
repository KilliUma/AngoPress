import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { EmailService } from './email.service'
import { ConfigService } from '@nestjs/config'
import { Queue, Worker, Job } from 'bullmq'
import { CampaignStatus, RecipientStatus } from '@prisma/client'

interface SendBatchJobData {
  campaignId: string
  batchSize?: number
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name)
  private readonly queue: Queue | undefined
  private worker: Worker | undefined
  private readonly isServerless: boolean
  private readonly appUrl: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    configService: ConfigService,
  ) {
    const redisHost = configService.get<string>('redis.host') ?? 'localhost'
    const redisPort = configService.get<number>('redis.port') ?? 6379
    const redisPassword = configService.get<string>('redis.password')
    this.appUrl = configService.get<string>('app.url') ?? 'http://localhost:3001'
    this.isServerless =
      process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

    const connection = {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      tls: configService.get<boolean>('redis.tls') ? {} : undefined,
    }

    if (this.isServerless) {
      this.logger.warn('Ambiente serverless detectado: envios imediatos serao processados inline')
      return
    }

    this.queue = new Queue('campaign-dispatch', { connection })

    this.worker = new Worker<SendBatchJobData>(
      'campaign-dispatch',
      async (job: Job<SendBatchJobData>) => {
        await this.processCampaign(job.data.campaignId, this.appUrl)
      },
      { connection, concurrency: 2 },
    )

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} falhou: ${err.message}`)
    })
  }

  /** Enfileira a campanha para envio imediato */
  async enqueueCampaign(campaignId: string, userId: string): Promise<void> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { _count: { select: { recipients: true } } },
    })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    if (campaign.userId !== userId) throw new ForbiddenException()
    if (campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Campanha já foi enviada ou está em envio')
    }

    // Verificar quota do plano
    await this.checkQuota(userId, campaign._count.recipients)

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.QUEUED },
    })

    if (this.isServerless || !this.queue) {
      await this.processCampaign(campaignId, this.appUrl)
      return
    }

    await this.queue.add(
      'send',
      { campaignId },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    )
  }

  /** Enfileira para envio futuro */
  async scheduleCampaign(campaignId: string, userId: string, scheduledAt: Date): Promise<void> {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } })
    if (!campaign) throw new NotFoundException('Campanha não encontrada')
    if (campaign.userId !== userId) throw new ForbiddenException()

    const delay = scheduledAt.getTime() - Date.now()
    if (delay < 0) throw new BadRequestException('Data de agendamento no passado')

    if (this.isServerless || !this.queue) {
      throw new BadRequestException(
        'Agendamento futuro indisponível neste deploy serverless. Use envio imediato ou configure um worker persistente.',
      )
    }

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SCHEDULED, scheduledAt },
    })

    await this.queue.add(
      'send',
      { campaignId },
      { delay, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    )
  }

  /** Worker: processa o envio de todos os destinatários pendentes */
  private async processCampaign(campaignId: string, _appUrl: string): Promise<void> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { pressRelease: true },
    })
    if (!campaign || !campaign.pressRelease) return

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.SENDING, sentAt: new Date() },
    })

    const recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId, status: RecipientStatus.PENDING },
      include: { journalist: true },
    })

    let failed = 0

    for (const recipient of recipients) {
      try {
        const personalizedHtml = this.personalize(campaign.pressRelease.content, {
          nome: recipient.journalist.name,
          veiculo: recipient.journalist.outlet,
        })

        await this.emailService.send({
          to: recipient.journalist.email,
          toName: recipient.journalist.name,
          subject: campaign.subject,
          html: personalizedHtml,
          trackingToken: recipient.trackingToken,
        })

        await this.prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: RecipientStatus.SENT, sentAt: new Date() },
        })
      } catch (err) {
        this.logger.error(
          `Falha ao enviar para ${recipient.journalist.email}: ${(err as Error).message}`,
        )
        await this.prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: RecipientStatus.FAILED },
        })
        failed++
      }
    }

    const finalStatus = failed === recipients.length ? CampaignStatus.FAILED : CampaignStatus.SENT

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: finalStatus },
    })

    // Incrementar contador de envios da subscrição
    await this.prisma.subscription
      .update({
        where: { userId: campaign.userId },
        data: { sendsUsed: { increment: recipients.length - failed } },
      })
      .catch(() => {
        /* utilizador sem subscrição activa — ignorar */
      })

    this.logger.log(
      `Campanha ${campaignId} concluída: ${recipients.length - failed} enviados, ${failed} falhas`,
    )
  }

  /** Verifica se o utilizador tem quota suficiente */
  private async checkQuota(userId: string, recipientCount: number): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })
    if (!subscription) return // sem subscrição = sem limite (admin usa)

    const remaining = subscription.plan.maxSendsMonth - subscription.sendsUsed
    if (remaining < recipientCount) {
      throw new BadRequestException(
        `Quota mensal insuficiente. Disponível: ${remaining}, necessário: ${recipientCount}`,
      )
    }
  }

  /** Substitui variáveis no template {{nome}}, {{veiculo}} */
  private personalize(html: string, vars: Record<string, string>): string {
    return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
  }
}
