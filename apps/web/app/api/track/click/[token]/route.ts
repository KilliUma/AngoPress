import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/track/click/[token]?url=https://... — público
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const { searchParams } = new URL(request.url)
  const redirectUrl = searchParams.get('url')

  try {
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
    })

    if (recipient && redirectUrl) {
      await prisma.emailEvent.create({
        data: {
          campaignId: recipient.campaignId,
          journalistId: recipient.journalistId,
          eventType: 'CLICKED',
          clickedUrl: redirectUrl,
          ipAddress:
            request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
          userAgent: request.headers.get('user-agent') ?? null,
        },
      })
    }
  } catch {
    // tracking failure must never block the redirect
  }

  if (!redirectUrl) {
    return new NextResponse('URL de destino em falta', { status: 400 })
  }

  return NextResponse.redirect(redirectUrl, { status: 302 })
}
