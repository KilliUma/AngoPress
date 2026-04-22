import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly ses: SESClient | null = null
  private readonly isConfigured: boolean
  private readonly fromEmail: string
  private readonly fromName: string
  private readonly appUrl: string

  constructor(configService: ConfigService) {
    const accessKeyId = configService.get<string>('aws.accessKeyId') ?? ''
    const secretAccessKey = configService.get<string>('aws.secretAccessKey') ?? ''
    this.fromEmail = configService.get<string>('aws.sesFromEmail') ?? 'noreply@angopress.ao'
    this.fromName = configService.get<string>('aws.sesFromName') ?? 'AngoPress'
    this.appUrl = configService.get<string>('app.url') ?? 'http://localhost:3001'

    this.isConfigured =
      accessKeyId !== '' &&
      accessKeyId !== 'SUBSTITUIR' &&
      secretAccessKey !== '' &&
      secretAccessKey !== 'SUBSTITUIR'

    if (this.isConfigured) {
      this.ses = new SESClient({
        region: configService.get<string>('aws.region') ?? 'us-east-1',
        credentials: { accessKeyId, secretAccessKey },
      })
    }
  }

  /**
   * Envia e-mail via SES.
   * Em modo dev (sem credenciais), loga o conteúdo no console.
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

    if (!this.isConfigured || !this.ses) {
      this.logger.debug(`[DEV] Simulando envio para ${to} — assunto: "${subject}"`)
      return
    }

    const input: SendEmailCommandInput = {
      Source: `"${this.fromName}" <${this.fromEmail}>`,
      Destination: { ToAddresses: [`"${toName}" <${to}>`] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: trackedHtml, Charset: 'UTF-8' } },
      },
    }

    await this.ses.send(new SendEmailCommand(input))
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
