import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SnsNotification {
  Type: string
  SubscribeURL?: string
  Message?: string
  Token?: string
  TopicArn?: string
}

interface SesMessage {
  notificationType: string
  bounce?: {
    bounceType: string
    bouncedRecipients: Array<{ emailAddress: string }>
  }
  complaint?: {
    complainedRecipients: Array<{ emailAddress: string }>
  }
  delivery?: {
    recipients: string[]
  }
  mail?: {
    messageId: string
  }
}

// POST /api/webhooks/ses — público (chamado pela AWS SNS)
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SnsNotification

    // Confirmar subscrição SNS
    if (body.Type === 'SubscriptionConfirmation' && body.SubscribeURL) {
      await fetch(body.SubscribeURL)
      return NextResponse.json({ ok: true })
    }

    if (body.Type !== 'Notification' || !body.Message) {
      return NextResponse.json({ ok: true })
    }

    const message: SesMessage = JSON.parse(body.Message)
    const notifType = message.notificationType

    if (notifType === 'Bounce' && message.bounce) {
      for (const recipient of message.bounce.bouncedRecipients) {
        const journalist = await prisma.journalist.findFirst({
          where: { email: recipient.emailAddress },
        })
        if (!journalist) continue

        await prisma.journalist.update({
          where: { id: journalist.id },
          data: {
            bounceCount: { increment: 1 },
            isActive: message.bounce.bounceType === 'Permanent' ? false : journalist.isActive,
          },
        })

        // Encontrar campanha mais recente que tenha este jornalista como destinatário pendente/enviado
        const campaignRecipient = await prisma.campaignRecipient.findFirst({
          where: { journalistId: journalist.id },
          orderBy: { createdAt: 'desc' },
        })
        if (campaignRecipient) {
          await prisma.emailEvent.create({
            data: {
              campaignId: campaignRecipient.campaignId,
              journalistId: journalist.id,
              eventType: 'BOUNCED',
            },
          })
          await prisma.campaignRecipient.update({
            where: { id: campaignRecipient.id },
            data: { status: 'BOUNCED' },
          })
        }
      }
    }

    if (notifType === 'Complaint' && message.complaint) {
      for (const recipient of message.complaint.complainedRecipients) {
        const journalist = await prisma.journalist.findFirst({
          where: { email: recipient.emailAddress },
        })
        if (!journalist) continue

        await prisma.journalist.update({
          where: { id: journalist.id },
          data: { isOptedOut: true },
        })

        const campaignRecipient = await prisma.campaignRecipient.findFirst({
          where: { journalistId: journalist.id },
          orderBy: { createdAt: 'desc' },
        })
        if (campaignRecipient) {
          await prisma.emailEvent.create({
            data: {
              campaignId: campaignRecipient.campaignId,
              journalistId: journalist.id,
              eventType: 'COMPLAINED',
            },
          })
          await prisma.campaignRecipient.update({
            where: { id: campaignRecipient.id },
            data: { status: 'OPTED_OUT' },
          })
        }
      }
    }

    if (notifType === 'Delivery' && message.delivery) {
      for (const email of message.delivery.recipients) {
        const journalist = await prisma.journalist.findFirst({ where: { email } })
        if (!journalist) continue

        const campaignRecipient = await prisma.campaignRecipient.findFirst({
          where: { journalistId: journalist.id, status: 'SENT' },
          orderBy: { createdAt: 'desc' },
        })
        if (campaignRecipient) {
          await prisma.emailEvent.create({
            data: {
              campaignId: campaignRecipient.campaignId,
              journalistId: journalist.id,
              eventType: 'DELIVERED',
            },
          })
          await prisma.campaignRecipient.update({
            where: { id: campaignRecipient.id },
            data: { status: 'DELIVERED' },
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
