import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export const maxDuration = 60

function personalize(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

function normalizeEmailBody(html: string): string {
  return html
    .replace(/<li\b[^>]*>\s*(?:<p\b[^>]*>)?\s*(?:<br\s*\/?>)?\s*(?:<\/p>)?\s*<\/li>/gi, '')
    .replace(/<li\b[^>]*>\s*<p\b([^>]*)>([\s\S]*?)<\/p>\s*<\/li>/gi, '<p$1>$2</p>')
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '<p>$1</p>')
    .replace(/<\/?(?:ol|ul)\b[^>]*>/gi, '')
}

function injectTrackingPixel(html: string, pixelUrl: string): string {
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`
  if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`)
  return html + pixel
}

function injectUnsubscribeLink(html: string, unsubscribeUrl: string): string {
  const footer = `
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font:12px Arial,sans-serif;color:#737373;">
      Recebeu este comunicado através da AngoPress.
      <a href="${unsubscribeUrl}" style="color:#8A0018;">Cancelar recepção destes envios</a>.
    </div>`
  if (html.includes('</body>')) return html.replace('</body>', `${footer}</body>`)
  return html + footer
}

// POST /api/campaigns/[id]/send
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        pressRelease: true,
        _count: { select: { recipients: true } },
      },
    })
    if (!campaign) return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.userId !== authUser.sub)
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    if (campaign.status === 'SENDING' || campaign.status === 'SENT') {
      return NextResponse.json(
        { message: 'Campanha já foi enviada ou está em envio' },
        { status: 400 },
      )
    }

    // Verificar assinatura, expiração e quota do plano
    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.sub },
      include: { plan: true },
    })
    if (authUser.role !== 'ADMIN') {
      if (!subscription) {
        return NextResponse.json({ message: 'Assinatura activa obrigatória' }, { status: 403 })
      }
      if (subscription.status !== 'ACTIVE') {
        return NextResponse.json({ message: 'A sua assinatura não está activa' }, { status: 403 })
      }
      if (subscription.expiresAt && subscription.expiresAt < new Date()) {
        await prisma.subscription.update({
          where: { userId: authUser.sub },
          data: { status: 'EXPIRED' },
        })
        return NextResponse.json({ message: 'A sua assinatura expirou' }, { status: 403 })
      }
      const remaining = subscription.plan.maxSendsMonth - subscription.sendsUsed
      if (remaining < campaign._count.recipients) {
        return NextResponse.json(
          {
            message: `Quota mensal insuficiente. Disponível: ${remaining}, necessário: ${campaign._count.recipients}`,
          },
          { status: 400 },
        )
      }
    }

    // Marcar como SENDING
    await prisma.campaign.update({ where: { id }, data: { status: 'SENDING', sentAt: new Date() } })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'

    const adminSignature = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        OR: [{ emailSignatureText: { not: null } }, { emailSignatureImageUrl: { not: null } }],
      },
      select: { emailSignatureText: true, emailSignatureImageUrl: true },
      orderBy: { createdAt: 'asc' },
    })

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: id, status: 'PENDING' },
      include: { journalist: true },
    })

    let failed = 0
    for (const recipient of recipients) {
      try {
        const personalized = personalize(campaign.pressRelease!.content, {
          nome: recipient.journalist.name,
          veiculo: recipient.journalist.outlet,
        })
        const cleanHtml = normalizeEmailBody(personalized)
        const pixelUrl = `${appUrl}/api/track/open/${recipient.trackingToken}`
        const unsubscribeUrl = `${appUrl}/api/unsubscribe/${recipient.trackingToken}`
        const trackedHtml = injectTrackingPixel(
          injectUnsubscribeLink(cleanHtml, unsubscribeUrl),
          pixelUrl,
        )

        await sendEmail({
          to: recipient.journalist.email,
          toName: recipient.journalist.name,
          subject: campaign.subject,
          html: trackedHtml,
          signature: {
            text: adminSignature?.emailSignatureText,
            imageUrl: adminSignature?.emailSignatureImageUrl,
          },
        })

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'SENT', sentAt: new Date() },
        })
      } catch (error) {
        console.error('[campaign-send] Falha ao enviar email', {
          campaignId: id,
          recipientId: recipient.id,
          journalistId: recipient.journalistId,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        })
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'FAILED' },
        })
        failed++
      }
    }

    const finalStatus = failed === recipients.length ? 'FAILED' : 'SENT'
    await prisma.campaign.update({ where: { id }, data: { status: finalStatus } })

    // Incrementar contador de envios
    if (subscription) {
      await prisma.subscription
        .update({
          where: { userId: authUser.sub },
          data: { sendsUsed: { increment: recipients.length - failed } },
        })
        .catch(() => {})
    }

    return NextResponse.json(
      { ok: true, sent: recipients.length - failed, failed },
      { status: 202 },
    )
  } catch (error) {
    console.error('[campaign-send] Erro interno', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    })
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
