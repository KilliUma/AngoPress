import { Resend } from 'resend'

const isConfigured =
  !!process.env.RESEND_API_KEY &&
  !process.env.RESEND_API_KEY.includes('SUBSTITUIR') &&
  !process.env.RESEND_API_KEY.includes('placeholder')

const resend = isConfigured ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'contacto@angopress.ao'
const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'AngoPress'

export async function sendEmail(params: {
  to: string
  toName: string
  subject: string
  html: string
}): Promise<void> {
  const { to, toName, subject, html } = params

  if (!resend) {
    console.debug(`[DEV] Simulando envio para ${to} — "${subject}"`)
    return
  }

  const result = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [`${toName} <${to}>`],
    subject,
    html,
  })

  if (result.error) {
    throw new Error(`Falha Resend: ${result.error.message}`)
  }
}

export async function sendSubscriptionActivatedEmail(params: {
  toEmail: string
  toName: string
  planName: string
  expiresAt: Date
  sendsPerMonth: number
}): Promise<void> {
  const { toEmail, toName, planName, expiresAt, sendsPerMonth } = params
  const expiry = expiresAt.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  await sendEmail({
    to: toEmail,
    toName,
    subject: `Assinatura AngoPress activada — Plano ${planName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#8a0018;">Bem-vindo ao AngoPress!</h2>
        <p>Olá <strong>${toName}</strong>,</p>
        <p>A sua assinatura do plano <strong>${planName}</strong> foi activada com sucesso.</p>
        <ul>
          <li><strong>Plano:</strong> ${planName}</li>
          <li><strong>Envios mensais:</strong> ${sendsPerMonth}</li>
          <li><strong>Válido até:</strong> ${expiry}</li>
        </ul>
        <p>Aceda à plataforma para começar a enviar campanhas.</p>
        <p style="color:#888;font-size:12px;">AngoPress — Plataforma de Mailing de Imprensa</p>
      </div>
    `,
  })
}

export function injectTrackingPixel(html: string, pixelUrl: string): string {
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`
  if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`)
  return html + pixel
}

export function personalizeContent(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}
