// Tipos e funções para consumir conteúdo da página Ajuda gerido no WordPress
import https from 'https'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface HelpFaqItem {
  question: string
  answer: string
}

export interface HelpFaqCategory {
  category: string
  items: HelpFaqItem[]
}

export interface HelpGuide {
  icon: string
  title: string
  desc: string
}

export interface HelpContact {
  email: string
  emailLabel: string
  emailNote: string
  whatsapp: string
  whatsappLabel: string
  whatsappNote: string
}

export interface HelpContent {
  faqs: HelpFaqCategory[]
  guides: HelpGuide[]
  contact: HelpContact
}

// ── Fallbacks ─────────────────────────────────────────────────────────────────

export const HELP_FALLBACK: HelpContent = {
  faqs: [
    {
      category: 'Press Releases',
      items: [
        {
          question: 'Como criar um press release?',
          answer:
            'Aceda a "Press Releases" no menu lateral e clique em "Novo press release". Preencha o título, corpo do comunicado e selecione as categorias relevantes. Pode guardar como rascunho ou publicar imediatamente.',
        },
        {
          question: 'Qual é o limite de press releases que posso criar?',
          answer:
            'O número de press releases que pode criar depende do seu plano de assinatura. Consulte a página "Meu Plano" para ver os limites do seu plano actual.',
        },
        {
          question: 'Posso editar um press release já publicado?',
          answer:
            'Sim. Aceda ao press release e clique no botão de edição. Tenha em conta que alterações após publicação não são re-enviadas automaticamente para jornalistas.',
        },
      ],
    },
    {
      category: 'Campanhas',
      items: [
        {
          question: 'Como funciona uma campanha de distribuição?',
          answer:
            'Uma campanha associa um press release a uma lista de mailing. Ao criar a campanha, seleciona o press release, a(s) lista(s) de destinatários e define a data/hora de envio. O sistema gere o envio de forma automática.',
        },
        {
          question: 'A campanha foi enviada mas não vejo estatísticas. Porquê?',
          answer:
            'As estatísticas de abertura e cliques são actualizadas de forma assíncrona. Aguarde alguns minutos após o envio e recarregue a página de Analytics.',
        },
        {
          question: 'Posso cancelar uma campanha agendada?',
          answer:
            'Sim, enquanto o estado for "Agendada" ou "Na fila". Aceda à campanha e use o botão de cancelamento. Após iniciar o envio (estado "A enviar"), não é possível cancelar.',
        },
      ],
    },
    {
      category: 'Jornalistas e Listas',
      items: [
        {
          question: 'Como importar jornalistas via CSV?',
          answer:
            'Na página Jornalistas, clique em "Importar CSV". O ficheiro deve ter as colunas: name, email, outlet, mediaType, city. Pode exportar a lista actual para ver o formato correcto.',
        },
        {
          question: 'Qual a diferença entre um jornalista e uma lista de mailing?',
          answer:
            'Os jornalistas são a base de dados de contactos. As listas de mailing são agrupamentos de jornalistas que usa para segmentar os envios das campanhas.',
        },
        {
          question: 'Um jornalista pode estar em várias listas?',
          answer:
            'Sim. Um jornalista pode pertencer a múltiplas listas de mailing simultaneamente.',
        },
      ],
    },
    {
      category: 'Assinatura e Pagamento',
      items: [
        {
          question: 'Como renovar a minha assinatura?',
          answer:
            'Aceda a "Meu Plano" e clique em "Solicitar renovação" no plano actual. A equipa AngoPress irá activar a renovação após confirmação do pagamento.',
        },
        {
          question: 'Como faço o pagamento?',
          answer:
            'O pagamento é feito via transferência bancária para o IBAN indicado na página de assinatura. Após a transferência, envie o comprovativo para pagamentos@angopress.ao ou WhatsApp +244 923 000 000.',
        },
        {
          question: 'O que acontece quando os envios do plano se esgotam?',
          answer:
            'Ao atingir o limite de envios do plano, não poderá criar novas campanhas até renovar ou actualizar o plano. O histórico e os dados ficam sempre acessíveis.',
        },
      ],
    },
  ],
  guides: [
    {
      icon: 'FileText',
      title: 'Criar o primeiro press release',
      desc: 'Passo a passo para redigir e publicar o seu primeiro comunicado.',
    },
    {
      icon: 'List',
      title: 'Organizar listas de mailing',
      desc: 'Como segmentar jornalistas por área, meio e região.',
    },
    {
      icon: 'Megaphone',
      title: 'Enviar a primeira campanha',
      desc: 'Da criação ao envio: guia completo de distribuição.',
    },
    {
      icon: 'BarChart2',
      title: 'Interpretar o Analytics',
      desc: 'Entender métricas de abertura, cliques e rejeição.',
    },
  ],
  contact: {
    email: 'suporte@angopress.ao',
    emailLabel: 'Email de suporte',
    emailNote: 'Resposta em até 24 horas úteis',
    whatsapp: '+244923000000',
    whatsappLabel: 'WhatsApp',
    whatsappNote: 'Disponível das 08h às 18h (dias úteis)',
  },
}

// ── HTTP helper (mesmo padrão de apps/landing — ignora cert auto-assinado do WP) ──

function wpGet(
  url: string,
): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WP request timeout')), 8000)

    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      clearTimeout(timeout)
      const status = res.statusCode ?? 0
      const ok = status >= 200 && status < 300
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8')
        resolve({
          ok,
          status,
          json: async () => JSON.parse(body) as unknown,
        })
      })
      res.on('error', reject)
    })

    req.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

async function fetchWp(base: string, route: string) {
  const normalizedBase = base.replace(/\/$/, '')
  const queryParams = new URLSearchParams()
  queryParams.set('rest_route', route)
  const restRouteUrl = `${normalizedBase}/?${queryParams.toString()}`
  const restRouteRes = await wpGet(restRouteUrl)
  if (restRouteRes.ok) return restRouteRes

  const primaryUrl = `${normalizedBase}/wp-json${route}`
  return wpGet(primaryUrl)
}

// ── Fetch principal ───────────────────────────────────────────────────────────

export async function getHelpContent(): Promise<HelpContent> {
  const base = process.env.WP_URL
  if (!base) return HELP_FALLBACK

  try {
    const res = await fetchWp(base, '/angopress/v1/help')
    if (!res.ok) throw new Error(`WP API ${res.status}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json()

    const faqs: HelpFaqCategory[] =
      Array.isArray(raw.faqs) && raw.faqs.length
        ? raw.faqs.map((cat: Record<string, unknown>) => ({
            category: String(cat.category ?? ''),
            items: Array.isArray(cat.items)
              ? (cat.items as Array<Record<string, string>>).map((it) => ({
                  question: String(it.question ?? ''),
                  answer: String(it.answer ?? ''),
                }))
              : [],
          }))
        : HELP_FALLBACK.faqs

    const guides: HelpGuide[] =
      Array.isArray(raw.guides) && raw.guides.length
        ? (raw.guides as Array<Record<string, string>>).map((g) => ({
            icon: String(g.icon ?? 'FileText'),
            title: String(g.title ?? ''),
            desc: String(g.desc ?? ''),
          }))
        : HELP_FALLBACK.guides

    const c = raw.contact ?? {}
    const contact: HelpContact = {
      email: String(c.email ?? HELP_FALLBACK.contact.email),
      emailLabel: String(c.email_label ?? HELP_FALLBACK.contact.emailLabel),
      emailNote: String(c.email_note ?? HELP_FALLBACK.contact.emailNote),
      whatsapp: String(c.whatsapp ?? HELP_FALLBACK.contact.whatsapp),
      whatsappLabel: String(c.whatsapp_label ?? HELP_FALLBACK.contact.whatsappLabel),
      whatsappNote: String(c.whatsapp_note ?? HELP_FALLBACK.contact.whatsappNote),
    }

    return { faqs, guides, contact }
  } catch {
    return HELP_FALLBACK
  }
}
