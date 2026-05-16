import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/prisma/prisma.service'
import { Resend } from 'resend'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly resend: Resend | null = null
  private readonly isConfigured: boolean
  private readonly fromAddress: string

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('resend.apiKey') ?? ''
    const fromName = this.config.get<string>('resend.fromName') ?? 'AngoPress'
    const fromEmail = this.config.get<string>('resend.fromEmail') ?? 'contacto@angopress.ao'

    this.fromAddress = `${fromName} <${fromEmail}>`
    this.isConfigured = apiKey !== '' && !apiKey.startsWith('re_placeholder')

    if (this.isConfigured) {
      this.resend = new Resend(apiKey)
    }
  }

  async sendSubscriptionActivated(opts: {
    toEmail: string
    toName: string
    planName: string
    expiresAt: Date
    sendsPerMonth: number
  }): Promise<void> {
    const { toEmail, toName, planName, expiresAt, sendsPerMonth } = opts
    const expiresFormatted = expiresAt.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const adminSignature = await this.getAdminSignature()
    const html = this.appendSignature(
      `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#5C0010;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">AngoPress</h1>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Assinatura activada, ${toName}! 🎉</h2>
      <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
        A sua subscrição do plano <strong style="color:#5C0010;">${planName}</strong> foi activada com sucesso.
      </p>

      <div style="background:#fdf2f4;border:1px solid #f9d7dc;border-radius:8px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Plano</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${planName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Envios disponíveis</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${sendsPerMonth.toLocaleString('pt-AO')}/mês</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Válido até</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${expiresFormatted}</td>
          </tr>
        </table>
      </div>

      <a href="${process.env.APP_URL ?? 'http://localhost:5173'}/subscription"
         style="display:inline-block;background:#5C0010;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:700;">
        Aceder à plataforma →
      </a>

      <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
        Este email foi enviado automaticamente pela AngoPress. Se tiver dúvidas, contacte o suporte.
      </p>
    </div>
  </div>
</body>
</html>`,
      adminSignature,
    )

    const text = `Olá ${toName},\n\nA sua subscrição do plano ${planName} foi activada com sucesso.\nEnvios disponíveis: ${sendsPerMonth}/mês\nVálido até: ${expiresFormatted}\n\nAceda à plataforma em: ${process.env.APP_URL ?? 'http://localhost:5173'}/subscription`

    try {
      if (!this.isConfigured || !this.resend) {
        this.logger.debug(
          `[DEV] Simulando envio de activação para ${toEmail} — plano: "${planName}"`,
        )
        return
      }

      await this.resend.emails.send({
        from: this.fromAddress,
        to: [toEmail],
        subject: `✅ Plano ${planName} activado — AngoPress`,
        html,
        text,
      })
      this.logger.log(`Email de activação enviado para ${toEmail}`)
    } catch (err) {
      // Email falhou mas não deve bloquear o fluxo
      this.logger.error(`Falha ao enviar email para ${toEmail}: ${(err as Error).message}`)
    }
  }

  private async getAdminSignature(): Promise<{ text: string | null; imageUrl: string | null }> {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { emailSignatureText: true, emailSignatureImageUrl: true },
      orderBy: { createdAt: 'asc' },
    })

    return {
      text: admin?.emailSignatureText ?? null,
      imageUrl: admin?.emailSignatureImageUrl ?? null,
    }
  }

  private appendSignature(
    html: string,
    signature: { text: string | null; imageUrl: string | null },
  ): string {
    if (!signature.text?.trim() && !signature.imageUrl?.trim()) return html

    const textHtml = signature.text
      ?.trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => `<div>${this.escapeHtml(line)}</div>`)
      .join('')

    const imageUrl = signature.imageUrl?.trim()
    const imageHtml = imageUrl
      ? `<img src="${this.escapeHtml(imageUrl)}" alt="Assinatura" style="display:block;max-width:220px;height:auto;margin-top:12px;border:0;" />`
      : ''

    const signatureHtml = `
      <div style="margin-top:32px;padding-top:18px;border-top:1px solid #e5e7eb;color:#374151;font-family:Arial,sans-serif;font-size:14px;line-height:1.55;">
        ${textHtml ?? ''}
        ${imageHtml}
      </div>
    `

    if (html.includes('</body>')) return html.replace('</body>', `${signatureHtml}</body>`)
    return `${html}${signatureHtml}`
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
