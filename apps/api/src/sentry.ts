import * as Sentry from '@sentry/node'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nodeProfilingIntegration: (() => any) | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nodeProfilingIntegration = require('@sentry/profiling-node').nodeProfilingIntegration
} catch {
  // profiling nativo não disponível neste ambiente — continua sem profiling
}

export function initSentry() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.npm_package_version,
    integrations: nodeProfilingIntegration ? [nodeProfilingIntegration()] : [],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    profilesSampleRate: 0.1,
    beforeSend(event) {
      // Não enviar em testes
      if (process.env.NODE_ENV === 'test') return null
      return event
    },
  })
}

export { Sentry }
