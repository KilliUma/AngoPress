# Load Tests — AngoPress

Scripts [k6](https://k6.io/) para testes de carga da API AngoPress.

## Pré-requisitos

```bash
brew install k6
```

## Scripts disponíveis

### Smoke test — verificação rápida de saúde
```bash
k6 run load-tests/smoke.js \
  -e BASE_URL=http://localhost:3001 \
  -e USER_EMAIL=demo@angopress.ao \
  -e USER_PASS=Demo@123!
```

### Cenário de campanhas — carga real
```bash
k6 run load-tests/campaign-send.js \
  -e BASE_URL=http://localhost:3001 \
  -e ADMIN_EMAIL=admin@angopress.ao \
  -e ADMIN_PASS=Admin@123!
```

## Thresholds

| Métrica | Limite |
|---|---|
| `http_req_duration` (p95) | < 800ms (smoke) / < 2000ms (campanha) |
| `http_req_failed` | < 5% |
| `campaign_errors` | < 10% |
| `metrics_latency` (p95) | < 1000ms |
