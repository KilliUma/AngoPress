import { existsSync, readFileSync } from 'node:fs'
import { Resend } from 'resend'

const ENV_FILES = ['.env.local', '.env', 'apps/api/.env.local', 'apps/api/.env']

function loadEnvFile(path) {
  if (!existsSync(path)) return

  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')

    if (!process.env[key]) process.env[key] = value
  }
}

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

for (const file of ENV_FILES) loadEnvFile(file)

const apiKey = process.env.RESEND_API_KEY
const to = argValue('--to') ?? process.env.TEST_EMAIL_TO
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const fromName = process.env.RESEND_FROM_NAME ?? 'AngoPress'

if (!apiKey || apiKey.includes('SUBSTITUIR') || apiKey.includes('placeholder')) {
  console.error('RESEND_API_KEY nao configurada.')
  console.error('Adiciona a chave em .env.local ou executa:')
  console.error('RESEND_API_KEY=re_xxx TEST_EMAIL_TO=teu@email.com npm run email:test')
  process.exit(1)
}

if (!to) {
  console.error('Destinatario nao configurado.')
  console.error('Usa TEST_EMAIL_TO=teu@email.com ou npm run email:test -- --to teu@email.com')
  process.exit(1)
}

const resend = new Resend(apiKey)
const sentAt = new Date().toLocaleString('pt-AO', { timeZone: 'Africa/Luanda' })

const result = await resend.emails.send({
  from: `${fromName} <${fromEmail}>`,
  to,
  subject: 'Teste de envio AngoPress via Resend',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#8a0018;">AngoPress - teste Resend</h2>
      <p>Este email confirma que a integracao inicial com a Resend esta funcional.</p>
      <p><strong>Data/hora:</strong> ${sentAt}</p>
    </div>
  `,
})

if (result.error) {
  console.error('Falha ao enviar email:')
  console.error(result.error)
  process.exit(1)
}

console.log('Email de teste enviado com sucesso.')
console.log(`ID Resend: ${result.data?.id ?? 'indisponivel'}`)
