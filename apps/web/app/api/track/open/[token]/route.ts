import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GIF transparente 1x1
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

// GET /api/track/open/[token] — público
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  try {
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
    })

    if (recipient) {
      // Evitar duplicados: só registar se ainda não há evento OPENED para este jornalista/campanha
      const existing = await prisma.emailEvent.findFirst({
        where: {
          campaignId: recipient.campaignId,
          journalistId: recipient.journalistId,
          eventType: 'OPENED',
        },
      })
      if (!existing) {
        await prisma.emailEvent.create({
          data: {
            campaignId: recipient.campaignId,
            journalistId: recipient.journalistId,
            eventType: 'OPENED',
            ipAddress:
              request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
            userAgent: request.headers.get('user-agent') ?? null,
          },
        })
      }
    }
  } catch {
    // tracking failure must never block the response
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
