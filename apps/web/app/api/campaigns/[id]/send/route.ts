import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

function personalize(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

function injectTrackingPixel(html: string, pixelUrl: string): string {
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`
  if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`)
  return html + pixel
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

    // Verificar quota do plano
    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.sub },
      include: { plan: true },
    })
    if (subscription) {
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

    const appUrl =
      (process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL)
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'

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
        const pixelUrl = `${appUrl}/api/track/open/${recipient.trackingToken}`
        const trackedHtml = injectTrackingPixel(personalized, pixelUrl)

        await sendEmail({
          to: recipient.journalist.email,
          toName: recipient.journalist.name,
          subject: campaign.subject,
          html: trackedHtml,
        })

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'SENT', sentAt: new Date() },
        })
      } catch {
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
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
