# Comparativo de Servicos de Email para AngoPress

## Contexto

A AngoPress precisa de enviar campanhas de email para jornalistas, com rastreio de aberturas, cliques, bounces e reclamações. Isto é diferente de uma caixa de correio profissional comum.

Planos como "Correio Basico 10GB", "Correio Essencial 50GB" e "Correio Premium 100GB" servem melhor para emails institucionais, como:

- suporte@angopress.ao
- pagamentos@angopress.ao
- contacto@angopress.ao

Para campanhas e envio em massa, a solução deve usar um serviço de email via API, com boa entregabilidade, gestão de reputação e webhooks.

## Opcoes Avaliadas

### Resend

O Resend e simples de integrar e operar. Tem boa experiencia para programadores, API directa, webhooks, tracking, batch sending e uma dashboard mais amigavel.

Pontos principais:

- Plano Free: 3.000 emails/mes, com limite de 100 emails/dia.
- Plano Pro: 20 USD/mes para 50.000 emails/mes.
- Emails extra no Pro: 0,90 USD por 1.000 emails.
- Sem limite diario nos planos pagos.
- Facil de configurar no MVP.
- O codigo actual da API da AngoPress ja esta orientado para Resend em `apps/api/src/dispatch/email.service.ts`.

Melhor uso:

- MVP.
- Lancamento inicial.
- Equipa pequena.
- Quando a simplicidade operacional vale mais do que o menor custo por email.

### Amazon SES

O Amazon SES tem melhor custo por email e e mais adequado para escala. E mais tecnico de configurar, porque exige gestao de AWS, producao fora do sandbox, DNS, reputacao, quotas e monitorizacao.

Pontos principais:

- Custo base: 0,10 USD por 1.000 emails enviados.
- Sem mensalidade obrigatoria.
- Quotas de envio por periodo de 24 horas e taxa por segundo.
- No sandbox: 200 emails por 24 horas e 1 email por segundo.
- Em producao, e possivel pedir aumento de quotas.
- Opcional: Virtual Deliverability Manager custa 0,07 USD por 1.000 emails adicionais.

Exemplo aproximado:

- 50.000 emails/mes no SES: cerca de 5 USD de envio base.
- 50.000 emails/mes com Virtual Deliverability Manager: cerca de 8,50 USD, antes de pequenos custos adicionais de dados.

Melhor uso:

- Escala.
- Maior volume mensal.
- Melhor margem financeira.
- Quando a equipa consegue gerir configuracao e monitorizacao tecnica.

## Comparacao Rapida

| Criterio | Resend | Amazon SES |
|---|---:|---:|
| Menor custo por email | Nao | Sim |
| Simplicidade de configuracao | Sim | Nao |
| Melhor para MVP | Sim | Medio |
| Melhor para escala | Medio | Sim |
| Dashboard e experiencia dev | Sim | Medio |
| Controlo e flexibilidade tecnica | Medio | Sim |
| Melhor custo-beneficio a longo prazo | Medio | Sim |

## Recomendacao

A melhor estrategia para a AngoPress e:

1. Comecar com Resend no MVP e no lancamento.
2. Configurar dominio ou subdominio dedicado para envios, por exemplo `mail.angopress.ao` ou `envios.angopress.ao`.
3. Configurar SPF, DKIM e DMARC.
4. Monitorizar volume, bounces, complaints e reputacao.
5. Migrar campanhas para Amazon SES quando o volume crescer, especialmente acima de 50.000 a 100.000 emails por mes.

## Decisao Recomendada

Para agora: **Resend**.

Motivo: o codigo ja esta preparado para Resend, a configuracao e mais rapida e reduz risco operacional no lancamento.

Para medio/longo prazo: **Amazon SES**.

Motivo: oferece melhor custo-beneficio em escala e melhora a margem da plataforma quando o volume de campanhas aumentar.

## Fontes

- Resend pricing: https://resend.com/pricing?product=transactional
- Resend quotas and limits: https://resend.com/docs/knowledge-base/account-quotas-and-limits
- Amazon SES pricing: https://aws.amazon.com/ses/pricing/
- Amazon SES sending quotas: https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html
