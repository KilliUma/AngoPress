import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { EmailEventType, RecipientStatus } from '@prisma/client'

interface SnsMessage {
  Type: string
  Message: string
  Token?: string
  SubscribeURL?: string
}

interface SesNotification {
  notificationType: string
  mail: { destination: string[] }
  bounce?: { bouncedRecipients: { emailAddress: string }[]; bounceType: string }
  complaint?: { complainedRecipients: { emailAddress: string }[] }
  delivery?: { recipients: string[] }
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(private readonly prisma: PrismaService) {}

  /** Processa notificação SNS do SES */
  async handleSesNotification(body: unknown): Promise<void> {
    const sns = body as SnsMessage

    // Confirmação de subscrição do tópico SNS
    if (sns.Type === 'SubscriptionConfirmation' && sns.SubscribeURL) {
      this.logger.log(`SNS SubscriptionConfirmation: ${sns.SubscribeURL}`)
      await fetch(sns.SubscribeURL).catch(() => {
        this.logger.error('Falha ao confirmar subscrição SNS')
      })
      return
    }

    if (sns.Type !== 'Notification') return

    let notification: SesNotification
    try {
      notification = JSON.parse(sns.Message) as SesNotification
    } catch {
      this.logger.warn('SNS Message inválido')
      return
    }

    switch (notification.notificationType) {
      case 'Bounce':
        await this.handleBounce(notification)
        break
      case 'Complaint':
        await this.handleComplaint(notification)
        break
      case 'Delivery':
        await this.handleDelivery(notification)
        break
      default:
        this.logger.debug(`Tipo SNS não tratado: ${notification.notificationType}`)
    }
  }

  private async handleBounce(notification: SesNotification): Promise<void> {
    const emails = notification.bounce?.bouncedRecipients.map((r) => r.emailAddress) ?? []
    const isHardBounce = notification.bounce?.bounceType === 'Permanent'

    for (const email of emails) {
      const journalist = await this.prisma.journalist.findUnique({ where: { email } })
      if (!journalist) continue

      if (isHardBounce) {
        await this.prisma.journalist.update({
          where: { id: journalist.id },
          data: { isActive: false, bounceCount: { increment: 1 } },
        })
      } else {
        await this.prisma.journalist.update({
          where: { id: journalist.id },
          data: { bounceCount: { increment: 1 } },
        })
      }

      // Registar evento em campanhas recentes
      const recipients = await this.prisma.campaignRecipient.findMany({
        where: {
          journalistId: journalist.id,
          status: { in: [RecipientStatus.SENT, RecipientStatus.PENDING] },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })

      for (const r of recipients) {
        await this.prisma.emailEvent.create({
          data: {
            campaignId: r.campaignId,
            journalistId: journalist.id,
            eventType: EmailEventType.BOUNCED,
          },
        })
        await this.prisma.campaignRecipient.update({
          where: { id: r.id },
          data: { status: RecipientStatus.BOUNCED },
        })
      }
    }
  }

  private async handleComplaint(notification: SesNotification): Promise<void> {
    const emails = notification.complaint?.complainedRecipients.map((r) => r.emailAddress) ?? []

    for (const email of emails) {
      const journalist = await this.prisma.journalist.findUnique({ where: { email } })
      if (!journalist) continue

      // Opt-out automático
      await this.prisma.journalist.update({
        where: { id: journalist.id },
        data: { isOptedOut: true },
      })

      const recipients = await this.prisma.campaignRecipient.findMany({
        where: { journalistId: journalist.id },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })

      for (const r of recipients) {
        await this.prisma.emailEvent.create({
          data: {
            campaignId: r.campaignId,
            journalistId: journalist.id,
            eventType: EmailEventType.COMPLAINED,
          },
        })
      }
    }
  }

  private async handleDelivery(notification: SesNotification): Promise<void> {
    const emails = notification.delivery?.recipients ?? []

    for (const email of emails) {
      const journalist = await this.prisma.journalist.findUnique({ where: { email } })
      if (!journalist) continue

      const recipients = await this.prisma.campaignRecipient.findMany({
        where: { journalistId: journalist.id, status: RecipientStatus.SENT },
        orderBy: { createdAt: 'desc' },
        take: 1,
      })

      for (const r of recipients) {
        await this.prisma.emailEvent.create({
          data: {
            campaignId: r.campaignId,
            journalistId: journalist.id,
            eventType: EmailEventType.DELIVERED,
          },
        })
        await this.prisma.campaignRecipient.update({
          where: { id: r.id },
          data: { status: RecipientStatus.DELIVERED },
        })
      }
    }
  }

  /** Processa opt-out via token único */
  async handleUnsubscribe(token: string): Promise<string> {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
      include: { journalist: true },
    })

    if (!recipient) {
      return this.unsubscribePage('Token inválido ou já processado.', false)
    }

    await this.prisma.journalist.update({
      where: { id: recipient.journalistId },
      data: { isOptedOut: true },
    })

    await this.prisma.emailEvent
      .create({
        data: {
          campaignId: recipient.campaignId,
          journalistId: recipient.journalistId,
          eventType: EmailEventType.UNSUBSCRIBED,
        },
      })
      .catch(() => {})

    return this.unsubscribePage(
      `O endereço <strong>${recipient.journalist.email}</strong> foi removido com sucesso da nossa lista de comunicações.`,
      true,
    )
  }

  private unsubscribePage(message: string, success: boolean): string {
    return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>Descadastro — AngoPress</title>
<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
.box{background:#fff;padding:2rem 2.5rem;border-radius:12px;max-width:480px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{margin:0 0 1rem;font-size:1.3rem;color:${success ? '#16a34a' : '#dc2626'}}
p{color:#555;line-height:1.6}</style></head>
<body><div class="box">
<h1>${success ? '✓ Descadastro confirmado' : 'Pedido inválido'}</h1>
<p>${message}</p>
</div></body></html>`
  }
}
