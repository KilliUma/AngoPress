/**
 * AngoPress — k6 Smoke Test
 * Testa os endpoints mais críticos com carga leve para verificar saúde geral.
 *
 * Usar: k6 run load-tests/smoke.js
 * Variáveis de ambiente:
 *   BASE_URL   — URL base da API (default: http://localhost:3001)
 *   USER_EMAIL — email de utilizador válido
 *   USER_PASS  — password do utilizador
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'
const USER_EMAIL = __ENV.USER_EMAIL || 'demo@angopress.ao'
const USER_PASS = __ENV.USER_PASS || 'Demo@123!'

const loginDuration = new Trend('login_duration', true)
const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '10s', target: 5 }, // ramp-up
    { duration: '30s', target: 5 }, // estável
    { duration: '10s', target: 0 }, // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% das requests < 800ms
    http_req_failed: ['rate<0.05'], // menos de 5% de erros
    errors: ['rate<0.05'],
  },
}

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: USER_EMAIL, password: USER_PASS }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  check(res, { 'login 200': (r) => r.status === 200 })
  const body = JSON.parse(res.body)
  return { token: body.accessToken }
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  }

  // 1. Dashboard stats — jornalistas
  let r = http.get(`${BASE_URL}/api/v1/journalists?limit=1`, { headers })
  errorRate.add(r.status !== 200)
  check(r, { 'journalists 200': (r) => r.status === 200 })

  // 2. Listas de mailing
  r = http.get(`${BASE_URL}/api/v1/mailing-lists`, { headers })
  errorRate.add(r.status !== 200)
  check(r, { 'mailing-lists 200': (r) => r.status === 200 })

  // 3. Campanhas
  r = http.get(`${BASE_URL}/api/v1/campaigns?limit=5`, { headers })
  errorRate.add(r.status !== 200)
  check(r, { 'campaigns 200': (r) => r.status === 200 })

  // 4. Assinatura
  r = http.get(`${BASE_URL}/api/v1/subscriptions/my`, { headers })
  errorRate.add(r.status !== 200 && r.status !== 404)
  check(r, { 'subscription 200/404': (r) => r.status === 200 || r.status === 404 })

  sleep(1)
}
