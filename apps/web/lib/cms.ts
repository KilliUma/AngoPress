// Tipos e funções para consumir conteúdo gerido no WordPress
import https from 'https'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string
  title: string
  content: string // HTML permitido
}

export interface LegalDocument {
  title: string
  subtitle: string
  lastUpdated: string
  contact: string
  sections: LegalSection[]
}

export interface LegalContent {
  termos: LegalDocument
  privacidade: LegalDocument
}

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

// ── Legal (Termos + Privacidade) ─────────────────────────────────────────────

export const LEGAL_FALLBACK: LegalContent = {
  termos: {
    title: 'Termos de Uso',
    subtitle: 'Condições que regem o uso da plataforma AngoPress.',
    lastUpdated: '7 de Maio de 2026',
    contact: 'suporte@angopress.ao',
    sections: [
      {
        id: 'aceitacao',
        title: 'Aceitação dos Termos',
        content:
          'Ao aceder ou usar a AngoPress, o utilizador confirma que leu, compreendeu e aceita estes Termos de Uso na íntegra. Se não concordar com alguma das cláusulas, deve cessar imediatamente o uso da plataforma.',
      },
      {
        id: 'uso-permitido',
        title: 'Uso Permitido',
        content:
          'A plataforma destina-se exclusivamente a comunicações legítimas de assessoria de imprensa e comunicação institucional. É <strong>proibido</strong> usar a AngoPress para envio de spam, conteúdos ilegais, falsas identidades, comunicações que violem direitos de terceiros ou qualquer actividade contrária à legislação angolana.',
      },
      {
        id: 'conta',
        title: 'Conta e Responsabilidade',
        content:
          'Cada utilizador é responsável pela segurança das suas credenciais de acesso. Deve notificar imediatamente a AngoPress em caso de uso não autorizado da conta.',
      },
      {
        id: 'assinaturas',
        title: 'Assinaturas e Pagamentos',
        content:
          'Os planos são activados manualmente após confirmação de pagamento. A AngoPress reserva-se o direito de suspender contas com pagamentos pendentes, abuso de envio ou reclamações recorrentes. Não são efectuados reembolsos após activação do plano.',
      },
      {
        id: 'propriedade',
        title: 'Propriedade Intelectual',
        content:
          'Todos os direitos sobre a plataforma pertencem à AngoPress. O utilizador mantém os direitos sobre o conteúdo que publica, concedendo à AngoPress uma licença limitada para processar e transmitir esse conteúdo.',
      },
      {
        id: 'limitacao',
        title: 'Limitação de Responsabilidade',
        content:
          'A AngoPress não se responsabiliza por falhas de entrega atribuíveis a servidores de terceiros, decisões editoriais dos jornalistas ou danos indirectos.',
      },
      {
        id: 'alteracoes',
        title: 'Alterações aos Termos',
        content:
          'A AngoPress pode actualizar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail com pelo menos 15 dias de antecedência.',
      },
      {
        id: 'contato',
        title: 'Contacto',
        content:
          'Para questões sobre estes Termos: <a href="mailto:suporte@angopress.ao" class="text-brand underline">suporte@angopress.ao</a>.',
      },
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    subtitle: 'Como a AngoPress recolhe, usa e protege os seus dados pessoais.',
    lastUpdated: '7 de Maio de 2026',
    contact: 'suporte@angopress.ao',
    sections: [
      {
        id: 'introducao',
        title: 'Introdução',
        content:
          'A AngoPress compromete-se a proteger a privacidade dos seus utilizadores. Esta Política descreve quais dados recolhemos, como os usamos e os seus direitos.',
      },
      {
        id: 'dados-recolhidos',
        title: 'Dados que Recolhemos',
        content:
          '<strong>Dados de conta:</strong> nome, e-mail, empresa e telefone.<br><strong>Dados de jornalistas:</strong> contactos importados para fins de mailing.<br><strong>Dados de campanhas:</strong> press releases, listas de envio e histórico.<br><strong>Dados de desempenho:</strong> abertura, clique, rejeição e descadastro.<br><strong>Dados de pagamento:</strong> referência de transacção e estado da assinatura.',
      },
      {
        id: 'finalidade',
        title: 'Finalidade do Tratamento',
        content:
          'Os dados são tratados para: prestar o serviço, gerir conta e assinatura, gerar relatórios, cumprir obrigações legais e enviar comunicações de serviço.',
      },
      {
        id: 'partilha',
        title: 'Partilha de Dados',
        content:
          'A AngoPress não vende dados a terceiros. Os dados podem ser partilhados com fornecedores de infra-estrutura (subprocessadores) e autoridades quando exigido por lei.',
      },
      {
        id: 'retencao',
        title: 'Retenção de Dados',
        content:
          'Os dados são conservados durante a vigência da conta e por mais 12 meses após encerramento. Dados de jornalistas descadastrados são removidos imediatamente.',
      },
      {
        id: 'direitos',
        title: 'Os Seus Direitos',
        content:
          'Tem direito a aceder, corrigir, eliminar, opor-se ao tratamento e exportar os seus dados. Contacte: <a href="mailto:suporte@angopress.ao" class="text-brand underline">suporte@angopress.ao</a>.',
      },
      {
        id: 'seguranca',
        title: 'Segurança',
        content:
          'Implementamos encriptação em trânsito (TLS), controlo de acessos por função e monitorização de actividade suspeita.',
      },
      {
        id: 'contato',
        title: 'Contacto',
        content:
          'Para exercício de direitos ou questões sobre privacidade: <a href="mailto:suporte@angopress.ao" class="text-brand underline">suporte@angopress.ao</a>.',
      },
    ],
  },
}

export async function getLegalContent(): Promise<LegalContent> {
  const base = process.env.WP_URL
  if (!base) return LEGAL_FALLBACK

  try {
    const res = await fetchWp(base, '/angopress/v1/legal')
    if (!res.ok) throw new Error(`WP API ${res.status}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json()

    function mapDoc(doc: Record<string, unknown>, fallback: LegalDocument): LegalDocument {
      return {
        title: String(doc.title ?? fallback.title),
        subtitle: String(doc.subtitle ?? fallback.subtitle),
        lastUpdated: String(doc.last_updated ?? fallback.lastUpdated),
        contact: String(doc.contact ?? fallback.contact),
        sections:
          Array.isArray(doc.sections) && doc.sections.length
            ? (doc.sections as Array<Record<string, string>>).map((s) => ({
                id: String(s.id ?? ''),
                title: String(s.title ?? ''),
                content: String(s.content ?? ''),
              }))
            : fallback.sections,
      }
    }

    return {
      termos: mapDoc(raw.termos ?? {}, LEGAL_FALLBACK.termos),
      privacidade: mapDoc(raw.privacidade ?? {}, LEGAL_FALLBACK.privacidade),
    }
  } catch {
    return LEGAL_FALLBACK
  }
}
