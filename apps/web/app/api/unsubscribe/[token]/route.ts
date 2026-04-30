import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/unsubscribe/[token] — público
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  try {
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { trackingToken: token },
      include: { journalist: true },
    })

    if (!recipient) {
      return new NextResponse(
        unsubscribeHtml('Link inválido', 'Este link de cancelamento não é válido.'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    }

    // Marcar como optedOut
    await prisma.journalist.update({
      where: { id: recipient.journalistId },
      data: { isOptedOut: true },
    })

    // Registar evento
    await prisma.emailEvent.create({
      data: {
        campaignId: recipient.campaignId,
        journalistId: recipient.journalistId,
        eventType: 'UNSUBSCRIBED',
      },
    })

    return new NextResponse(
      unsubscribeHtml(
        'Cancelamento de subscrição',
        `O e-mail ${recipient.journalist.email} foi removido da nossa lista de envios.`,
      ),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  } catch {
    return new NextResponse(unsubscribeHtml('Erro', 'Ocorreu um erro ao processar o seu pedido.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function unsubscribeHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — AngoPress</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: #fff; border-radius: 8px; padding: 40px; max-width: 460px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    h1 { color: #111; font-size: 1.4rem; }
    p { color: #555; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
