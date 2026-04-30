/**
 * AngoPress — k6 Load Test: Envio de Campanhas
 * Simula múltiplos utilizadores a criarem campanhas e verificarem métricas.
 *
 * Usar: k6 run load-tests/campaign-send.js
 * Variáveis de ambiente:
 *   BASE_URL       — URL base da API (default: http://localhost:3001)
 *   ADMIN_EMAIL    — email de admin
 *   ADMIN_PASS     — password de admin
 *   MAILING_LIST_ID — ID de mailing list existente
 *   PRESS_RELEASE_ID — ID de press release existente
 */

import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@angopress.ao'
const ADMIN_PASS = __ENV.ADMIN_PASS || 'Admin@123!'

const campaignsCreated = new Counter('campaigns_created')
const campaignErrors = new Rate('campaign_errors')
const metricsLatency = new Trend('metrics_latency', true)

export const options = {
  stages: [
    { duration: '15s', target: 3 },
    { duration: '60s', target: 3 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    campaign_errors: ['rate<0.10'],
    metrics_latency: ['p(95)<1000'],
  },
}

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  check(res, { 'admin login': (r) => r.status === 200 })
  const body = JSON.parse(res.body)

  // Obter um press release e uma mailing list para criar campanhas
  const headers = {
    Authorization: `Bearer ${body.accessToken}`,
    'Content-Type': 'application/json',
  }

  const prRes = http.get(`${BASE_URL}/api/v1/press-releases?limit=1`, { headers })
  const mlRes = http.get(`${BASE_URL}/api/v1/mailing-lists`, { headers })

  const pr = JSON.parse(prRes.body)
  const ml = JSON.parse(mlRes.body)

  return {
    token: body.accessToken,
    pressReleaseId: __ENV.PRESS_RELEASE_ID || pr?.data?.[0]?.id,
    mailingListId: __ENV.MAILING_LIST_ID || ml?.[0]?.id,
  }
}

export default function (data) {
  if (!data.pressReleaseId || !data.mailingListId) {
    console.warn('Sem press release ou mailing list disponível — a saltar teste de campanha')
    sleep(2)
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  }

  group('Criar e enviar campanha', () => {
    // 1. Criar campanha
    const campaignName = `Load Test ${__VU}-${__ITER}-${Date.now()}`
    const createRes = http.post(
      `${BASE_URL}/api/v1/campaigns`,
      JSON.stringify({
        name: campaignName,
        subject: `[LoadTest] ${campaignName}`,
        fromName: 'AngoPress Test',
        pressReleaseId: data.pressReleaseId,
        mailingListIds: [data.mailingListId],
      }),
      { headers },
    )

    const created = check(createRes, { 'campanha criada 201': (r) => r.status === 201 })
    campaignErrors.add(!created)

    if (!created) {
      sleep(1)
      return
    }

    campaignsCreated.add(1)
    const campaign = JSON.parse(createRes.body)

    // 2. Verificar detalhe da campanha
    const detailRes = http.get(`${BASE_URL}/api/v1/campaigns/${campaign.id}`, { headers })
    check(detailRes, { 'detalhe campanha 200': (r) => r.status === 200 })

    // 3. Métricas (campanha em rascunho — retorna vazio mas deve ser 200)
    const metricsStart = Date.now()
    const metricsRes = http.get(`${BASE_URL}/api/v1/campaigns/${campaign.id}/metrics`, { headers })
    metricsLatency.add(Date.now() - metricsStart)
    check(metricsRes, { 'métricas 200': (r) => r.status === 200 })
  })

  sleep(2)
}
