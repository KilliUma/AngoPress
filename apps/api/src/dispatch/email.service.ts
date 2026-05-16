import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly resend: Resend | null = null
  private readonly isConfigured: boolean
  private readonly fromEmail: string
  private readonly fromName: string
  private readonly appUrl: string

  constructor(configService: ConfigService) {
    const apiKey = configService.get<string>('resend.apiKey') ?? ''
    this.fromEmail = configService.get<string>('resend.fromEmail') ?? 'contacto@angopress.ao'
    this.fromName = configService.get<string>('resend.fromName') ?? 'AngoPress'
    this.appUrl = configService.get<string>('app.url') ?? 'http://localhost:3001'

    this.isConfigured = apiKey !== '' && !apiKey.startsWith('re_placeholder')

    if (this.isConfigured) {
      this.resend = new Resend(apiKey)
    }
  }

  /**
   * Envia e-mail via Resend.
   * Em modo dev (sem API key), loga o conteúdo no console.
   */
  async send(params: {
    to: string
    toName: string
    subject: string
    html: string
    trackingToken: string
  }): Promise<void> {
    const { to, toName, subject, html, trackingToken } = params

    // Injectar pixel de rastreio no final do HTML
    const pixelUrl = `${this.appUrl}/api/v1/track/open/${trackingToken}`
    const trackedHtml = this.injectTrackingPixel(html, pixelUrl)

    if (!this.isConfigured || !this.resend) {
      this.logger.debug(`[DEV] Simulando envio para ${to} — assunto: "${subject}"`)
      return
    }

    const result = await this.resend.emails.send({
      from: `${this.fromName} <${this.fromEmail}>`,
      to: [`${toName} <${to}>`],
      subject,
      html: trackedHtml,
    })

    if (result.error) {
      const { name, message, statusCode } = result.error
      throw new Error(
        `Resend rejeitou o envio (${name}, ${statusCode ?? 'sem status'}): ${message}`,
      )
    }

    this.logger.log(`Email enviado para ${to} via Resend: ${result.data.id}`)
  }

  /** Injecta pixel 1×1 transparente antes de </body> */
  private injectTrackingPixel(html: string, pixelUrl: string): string {
    const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`
    if (html.includes('</body>')) {
      return html.replace('</body>', `${pixel}</body>`)
    }
    return html + pixel
  }
}
