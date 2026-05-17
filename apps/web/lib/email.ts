import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Resend, type Attachment } from 'resend'

const isConfigured =
  !!process.env.RESEND_API_KEY &&
  !process.env.RESEND_API_KEY.includes('SUBSTITUIR') &&
  !process.env.RESEND_API_KEY.includes('placeholder')

const resend = isConfigured ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'contacto@angopress.ao'
const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'AngoPress'
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function sendEmail(params: {
  to: string
  toName: string
  subject: string
  html: string
  signature?: EmailSignature
  sender?: { name: string; email: string }
}): Promise<void> {
  const { to, toName, subject, html, signature, sender } = params
  const { html: htmlWithSignature, attachments } = await appendEmailSignature(html, signature)

  const fromName = sender?.name ?? FROM_NAME
  const replyTo = sender?.email ?? undefined

  if (!resend) {
    console.debug(`[DEV] Simulando envio de "${fromName}" para ${to} — "${subject}"`)
    return
  }

  const result = await resend.emails.send({
    from: `${fromName} <${FROM_EMAIL}>`,
    to: [`${toName} <${to}>`],
    replyTo: replyTo,
    subject,
    html: htmlWithSignature,
    attachments,
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
  signature?: EmailSignature
}): Promise<void> {
  const { toEmail, toName, planName, expiresAt, sendsPerMonth, signature } = params
  const expiry = expiresAt.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  await sendEmail({
    to: toEmail,
    toName,
    subject: `Assinatura AngoPress activada — Plano ${planName}`,
    signature,
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

export interface EmailSignature {
  text?: string | null
  imageUrl?: string | null
}

export async function appendEmailSignature(
  html: string,
  signature?: EmailSignature,
): Promise<{ html: string; attachments?: Attachment[] }> {
  if (!signature?.text?.trim() && !signature?.imageUrl?.trim()) return { html }

  const textHtml = signature.text
    ?.trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join('')

  const image = await getSignatureImage(signature.imageUrl?.trim() ?? '')
  const imageHtml = image.src
    ? `<img src="${escapeHtml(image.src)}" alt="Assinatura" style="display:block;max-width:220px;height:auto;margin-top:12px;border:0;" />`
    : ''

  const signatureHtml = `
    <div style="margin-top:32px;padding-top:18px;border-top:1px solid #e5e7eb;color:#374151;font-family:Arial,sans-serif;font-size:14px;line-height:1.55;">
      ${textHtml ?? ''}
      ${imageHtml}
    </div>
  `

  const signedHtml = html.includes('</body>')
    ? html.replace('</body>', `${signatureHtml}</body>`)
    : `${html}${signatureHtml}`

  return { html: signedHtml, attachments: image.attachment ? [image.attachment] : undefined }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function toAbsoluteUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (!url.startsWith('/')) return url

  return `${APP_URL.replace(/\/$/, '')}${url}`
}

async function getSignatureImage(
  rawUrl: string,
): Promise<{ src: string; attachment?: Attachment }> {
  if (!rawUrl) return { src: '' }

  const localPath = getLocalPublicPath(rawUrl)
  if (!localPath) return { src: toAbsoluteUrl(rawUrl) }

  if (!existsSync(localPath)) return { src: '' }

  const content = await readFile(localPath)
  const contentType = getContentType(localPath)

  return {
    src: 'cid:angopress-signature-image',
    attachment: {
      content,
      filename: path.basename(localPath),
      contentType,
      contentId: 'angopress-signature-image',
    },
  }
}

function getLocalPublicPath(rawUrl: string): string | null {
  let pathname = rawUrl

  if (/^https?:\/\//i.test(rawUrl)) {
    const url = new URL(rawUrl)
    const appUrl = new URL(APP_URL)
    if (
      url.hostname !== 'localhost' &&
      url.hostname !== '127.0.0.1' &&
      url.origin !== appUrl.origin
    ) {
      return null
    }
    pathname = url.pathname
  }

  if (!pathname.startsWith('/uploads/')) return null

  const publicDir = process.cwd().endsWith(`${path.sep}apps${path.sep}web`)
    ? path.join(process.cwd(), 'public')
    : path.join(process.cwd(), 'apps', 'web', 'public')

  return path.join(publicDir, pathname)
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'application/octet-stream'
}

export function injectTrackingPixel(html: string, pixelUrl: string): string {
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />`
  if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`)
  return html + pixel
}

export function personalizeContent(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}
