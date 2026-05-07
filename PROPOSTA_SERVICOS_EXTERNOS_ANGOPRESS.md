# Proposta de Serviços Externos Anuais - AngoPress

Documento de apoio comercial
Data: Maio/2026
Moeda: Kz (estimativas)

## 1. Objectivo

Este documento apresenta a previsão anual dos serviços externos necessários para operar a solução AngoPress em produção, separando:

- custo de desenvolvimento (não incluído aqui)
- custo de operação e infraestrutura (incluído aqui)

A proposta foi ajustada à realidade actual da AngoPress:

- landing page e app web em produção
- API/backoffice com autenticação, campanhas, analytics e assinatura
- envio de e-mails transaccionais e de campanha
- backups, monitorização e operação técnica recorrente

## 2. Âmbito da AngoPress considerado nesta previsão

A estimativa cobre os serviços externos para suportar:

- Website público (Landing)
- Aplicação Web (Dashboard)
- API e serviços internos
- Base de dados
- Envio de e-mails (transaccionais e operacionais)
- Domínio, SSL, backup e monitorização

## 3. Serviços externos considerados

| # | Serviço externo | Finalidade na AngoPress | Periodicidade | Estimativa anual |
|---|------------------|--------------------------|---------------|------------------|
| 1 | Amazon SES (ou equivalente) | E-mails transaccionais e notificações de sistema | Anual/consumo | 55.000 Kz a 137.000 Kz |
| 2 | VPS (API + serviços internos) | API, jobs, webhooks e operação interna | Anual | 132.000 Kz a 263.000 Kz |
| 3 | Vercel | Hospedagem da landing e app web com CDN e deploy contínuo | Anual | 220.000 Kz a 250.000 Kz |
| 4 | Domínio | Endereço oficial da plataforma | Anual | 15.000 Kz a 40.000 Kz |
| 5 | SSL | HTTPS (pode ser gratuito dependendo da configuração) | Anual | 0 Kz a 50.000 Kz |
| 6 | Backup e monitorização | Backup de dados, disponibilidade e suporte básico de infra | Anual | 65.000 Kz a 250.000 Kz |

## 4. Opção 1 - Económica (tudo em VPS)

Nesta opção, landing, app web, API e base de dados ficam concentrados numa única VPS.

### Composição

- VPS única para frontend + backend + base de dados
- serviço de e-mail transaccional
- domínio e SSL
- backup básico

### Estimativa anual

| Item | Faixa anual |
|------|-------------|
| VPS | 132.000 Kz a 263.000 Kz |
| Amazon SES | 55.000 Kz a 137.000 Kz |
| Domínio | 15.000 Kz a 40.000 Kz |
| SSL | 0 Kz a 50.000 Kz |
| Backup básico | 65.000 Kz a 100.000 Kz |
| **Total anual estimado** | **320.000 Kz a 537.000 Kz** |

### Leitura comercial

- Mínimo: 320.000 Kz/ano
- Médio recomendado: 537.000 Kz/ano
- Com margem: 450.000 Kz a 590.000 Kz/ano

## 5. Opção 2 - Profissional recomendada (Vercel + VPS)

Nesta opção, o frontend (landing + app web) fica em Vercel e a API/serviços internos ficam em VPS dedicada.

### Composição

- Vercel para interfaces web (landing e dashboard)
- VPS para API, regras de negócio, jobs, webhooks e base operacional
- serviço de e-mail transaccional
- domínio e SSL
- backup e monitorização com nível superior

### Estimativa anual

| Item | Faixa anual |
|------|-------------|
| Vercel | 220.000 Kz a 250.000 Kz |
| VPS | 132.000 Kz a 263.000 Kz |
| Amazon SES | 55.000 Kz a 137.000 Kz |
| Domínio | 15.000 Kz a 40.000 Kz |
| SSL | 0 Kz a 50.000 Kz |
| Backup e monitorização | 65.000 Kz a 130.000 Kz |
| **Total anual estimado** | **510.000 Kz a 770.000 Kz** |

### Leitura comercial

- Mínimo: 510.000 Kz/ano
- Recomendado para proposta: 770.000 Kz/ano
- Com margem: 850.000 Kz a 900.000 Kz/ano

## 6. Comparação das opções

| Critério | Opção 1 - VPS única | Opção 2 - Vercel + VPS |
|----------|----------------------|--------------------------|
| Custo anual | Mais baixo | Mais alto |
| Performance frontend | Boa, dependente da VPS | Melhor, com CDN e deploy optimizado |
| Manutenção | Mais complexa | Mais organizada |
| Escalabilidade | Média | Alta |
| Segurança operacional | Boa, mas concentrada | Melhor separação por camadas |
| Adequação AngoPress | Aceitável | **Mais recomendada** |

## 7. Recomendação para AngoPress

A recomendação para a AngoPress é a **Opção 2 (Vercel + VPS)**, porque:

- separa frontend e backend
- melhora a performance percebida pelo utilizador
- reduz risco operacional numa plataforma com campanhas, analytics e assinaturas
- facilita manutenção, deploy e crescimento futuro

## 8. Nota de variação de custos

Os valores apresentados são estimativas comerciais para orçamento e podem variar conforme:

- câmbio e forma de pagamento dos fornecedores
- volume de e-mails enviados
- crescimento de utilizadores e tráfego
- nível de monitorização e suporte contratado

## 9. Texto sugerido para envio ao cliente

Para os serviços externos da AngoPress, sugerimos trabalhar com previsão anual.

Temos duas opções principais:

- **Opção 1 - Económica:** tudo numa VPS (landing, app web, API, base de dados, e-mail e backup básico). Estimativa: **320.000 Kz a 537.000 Kz/ano** como faixa inicial de apresentação.
- **Opção 2 - Profissional recomendada:** frontend em Vercel e API/serviços internos em VPS dedicada, com melhor organização, performance e escalabilidade. Estimativa: **510.000 Kz a 770.000 Kz/ano** como faixa recomendada para proposta.

Para e-mails transaccionais, o uso de Amazon SES (ou equivalente) permanece a opção mais eficiente em custo/benefício para a realidade da plataforma.

A nossa recomendação final é a **Opção 2**, por oferecer base técnica mais sólida para operação, manutenção e crescimento da AngoPress.

## 10. Nota: Levantamento Orçamental para Serviço de Pagamento

Os custos relativos à integração e operação do serviço de pagamento **não estão incluídos** nesta proposta. A posteriori, deverá ser efectuado um levantamento orçamental específico para este módulo, contemplando os seguintes pontos:

| # | Serviço | Descrição |
|---|---------|-----------|
| 1 | Integração pagamento por referência | Criação da cobrança, geração/recepção da referência e registo da transacção |
| 2 | Integração GPO / Gateway Online | Integração do pagamento online via AppyPay/GPO e retorno do estado da operação |
| 3 | Integração Unitel Mobile Money | Integração do pagamento por UMM, validação e confirmação da transacção |
| 4 | Webhook / callback de confirmação | Endpoint para receber confirmação automática dos pagamentos da AppyPay |
| 5 | Histórico de pagamentos | Registo das transacções, estados, logs e dados de auditoria |
| 6 | Documentação técnica básica | Documentação dos fluxos, endpoints, variáveis e configurações |

Este levantamento deve ser realizado numa fase posterior, após definição do parceiro de pagamento e modelo de cobrança a adoptar pela AngoPress.

**ATT:** Estes serviços são opcionais e devem ser adquiridos de acordo com a necessidade.
