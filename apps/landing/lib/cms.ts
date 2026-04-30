// Tipos e funções para consumir conteúdo gerido no WordPress

export interface HeroContent {
  badge: string
  headlineLine1: string
  headlineLine2: string
  subtitle: string
  ctaPrimaryLabel: string
  ctaPrimaryUrl: string
  ctaSecondaryLabel: string
  ctaSecondaryUrl: string
}

export interface AboutPillar {
  title: string
  description: string
  accent: 'brand' | 'violet' | 'emerald' | 'amber'
}

export interface AboutContent {
  sectionLabel: string
  title: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  pillars: AboutPillar[]
}

export interface NewsArticle {
  slug: string
  category: string
  title: string
  excerpt: string
  readTime: string
  url: string
  accent: 'brand' | 'blue' | 'violet' | 'emerald' | 'amber'
  imageUrl?: string
  publishedAt: string
}

export interface PricingContent {
  sectionLabel: string
  title: string
  description: string
  paymentTitle: string
  paymentDescription: string
}

export interface NewsArticlePreview {
  slug: string
  title: string
  category: string
  imageUrl?: string
  publishedAt: string
}

export interface NewsArticleFull extends NewsArticle {
  content: string
  prev: NewsArticlePreview | null
  next: NewsArticlePreview | null
  related: NewsArticlePreview[]
  recent: NewsArticlePreview[]
}

export interface NewsContent {
  sectionLabel: string
  title: string
  description: string
  badge: string
  articles: NewsArticle[]
}

export interface HowItWorksStep {
  title: string
  description: string
  accent: 'brand' | 'violet' | 'emerald'
}

export interface HowItWorksFeature {
  title: string
  description: string
  accent: 'brand' | 'blue' | 'violet' | 'emerald' | 'amber' | 'cyan'
}

export interface HowItWorksContent {
  sectionLabel: string
  title: string
  subtitle: string
  featuresTitle: string
  ctaLabel: string
  ctaUrl: string
  steps: HowItWorksStep[]
  features: HowItWorksFeature[]
}

export interface JournalistCtaContent {
  badge: string
  titleLine1: string
  titleLine2: string
  description: string
  secondaryCtaLabel: string
  secondaryCtaUrl: string
}

export interface LandingContent {
  hero: HeroContent
  about: AboutContent
  news: NewsContent
  howItWorks: HowItWorksContent
  journalistCta: JournalistCtaContent
  pricing: PricingContent
}

// ── Fallbacks usados quando a API WordPress não está disponível ──
export const HERO_FALLBACK: HeroContent = {
  badge: 'Plataforma nº 1 de Comunicação de Imprensa em Angola',
  headlineLine1: 'Conecte a sua marca',
  headlineLine2: 'aos jornalistas certos',
  subtitle:
    'Crie, segmente e envie press releases para toda a imprensa angolana. Rastreie aberturas, cliques e resultados em tempo real.',
  ctaPrimaryLabel: 'Começar gratuitamente',
  ctaPrimaryUrl: '/cadastro',
  ctaSecondaryLabel: 'Ver como funciona',
  ctaSecondaryUrl: '#como-funciona',
}

export const ABOUT_FALLBACK: AboutContent = {
  sectionLabel: 'Sobre a plataforma',
  title: 'Plataforma Digital de Comunicação e Mailing de Imprensa',
  paragraph1:
    'O projecto consiste no desenvolvimento de uma plataforma digital voltada para o mercado angolano, com foco em assessoria de imprensa e comunicação institucional.',
  paragraph2:
    'A plataforma tem como objectivo <strong class="text-white/70">conectar empresas, assessores de comunicação e jornalistas</strong>, permitindo a criação, gestão e envio de press releases de forma segmentada, além do acompanhamento de métricas de desempenho.',
  paragraph3:
    'A solução busca resolver a falta de organização, segmentação e mensuração nos envios de comunicação para a imprensa, oferecendo uma ferramenta <strong class="text-white/70">centralizada, eficiente e escalável</strong>.',
  pillars: [
    {
      title: 'Conecta',
      description:
        'Rede verificada de jornalistas e órgãos de comunicação angolanos, segmentada por área editorial.',
      accent: 'brand',
    },
    {
      title: 'Segmenta',
      description: 'Envios dirigidos por área editorial, tipo de média e localização.',
      accent: 'violet',
    },
    {
      title: 'Mensura',
      description: 'Analytics de aberturas, cliques e resultados em tempo real.',
      accent: 'emerald',
    },
    {
      title: 'Escalável',
      description: 'Planos adaptados ao crescimento de cada organização.',
      accent: 'amber',
    },
  ],
}

export const NEWS_FALLBACK: NewsContent = {
  sectionLabel: 'Notícias',
  title: 'Últimas da AngoPress',
  description:
    'Novidades da plataforma, tendências do sector e dicas para uma comunicação mais eficaz.',
  badge: 'Em breve — integração com blog',
  articles: [
    {
      slug: 'angopress-analytics',
      category: 'Plataforma',
      title: 'AngoPress lança nova versão com analytics avançados',
      excerpt:
        'A nova versão da plataforma traz métricas detalhadas de abertura e cliques, ajudando as empresas a medir o impacto das suas comunicações.',
      readTime: '4 min',
      url: '',
      accent: 'brand',
      imageUrl: '',
      publishedAt: '2026-01-15T10:00:00+01:00',
    },
    {
      slug: 'comunicacao-digital-angola',
      category: 'Mercado',
      title: 'Comunicação digital cresce 40% no mercado angolano',
      excerpt:
        'Estudos recentes apontam para um crescimento significativo na adopção de ferramentas digitais de comunicação por empresas angolanas.',
      readTime: '6 min',
      url: '',
      accent: 'blue',
      imageUrl: '',
      publishedAt: '2026-02-01T10:00:00+01:00',
    },
    {
      slug: 'angopress-cobertura-nacional',
      category: 'Parceria',
      title: 'AngoPress expande rede de jornalistas para todas as províncias',
      excerpt:
        'A plataforma anuncia cobertura nacional com jornalistas registados em todas as 18 províncias de Angola.',
      readTime: '5 min',
      url: '',
      accent: 'violet',
      imageUrl: '',
      publishedAt: '2026-03-10T10:00:00+01:00',
    },
  ],
}

export const PRICING_FALLBACK: PricingContent = {
  sectionLabel: 'Planos e Preços',
  title: 'Comece hoje. Cresça ao seu ritmo.',
  description: 'Todos os planos incluem acesso à plataforma e à base de jornalistas angolanos.',
  paymentTitle: 'Pagamento simples e local',
  paymentDescription:
    'Após escolher o plano, disponibilizamos o <strong>IBAN</strong> para depósito bancário e o contacto (e-mail/WhatsApp) para envio do comprovativo. O acesso é activado ou renovado após confirmação do pagamento.',
}

export const HOW_IT_WORKS_FALLBACK: HowItWorksContent = {
  sectionLabel: 'Como funciona',
  title: 'Simples, rápido e eficaz',
  subtitle: 'Em apenas três passos, os seus press releases chegam aos jornalistas certos.',
  featuresTitle: 'Tudo incluído, sem surpresas',
  ctaLabel: 'Criar a minha conta grátis',
  ctaUrl: '/cadastro',
  steps: [
    {
      title: 'Crie o seu press release',
      description:
        'Use o nosso editor rico para escrever, formatar e anexar materiais. Guarde como rascunho e revise quando quiser.',
      accent: 'brand',
    },
    {
      title: 'Segmente os destinatários',
      description:
        'Filtre jornalistas por cidade, editoria (economia, política, tecnologia…) e tipo de mídia (TV, rádio, digital, imprensa).',
      accent: 'violet',
    },
    {
      title: 'Envie e acompanhe os resultados',
      description:
        'Dispare imediatamente ou agende para o melhor horário. Acompanhe aberturas, cliques e bounces em tempo real.',
      accent: 'emerald',
    },
  ],
  features: [
    {
      title: 'Editor de press releases',
      description:
        'Escreva e formate com um editor rico que suporta imagens, blocos de citação e pré-visualização antes do envio.',
      accent: 'brand',
    },
    {
      title: 'Base de jornalistas angolanos',
      description:
        'Aceda a uma base curada de jornalistas de TV, rádio, imprensa escrita, media digital e podcasts em Angola.',
      accent: 'blue',
    },
    {
      title: 'Sistema de filtros avançados',
      description:
        'Filtre por cidade, editoria (economia, política, cultura, tecnologia…) e tipo de mídia para chegar ao público certo.',
      accent: 'violet',
    },
    {
      title: 'Analytics em tempo real',
      description:
        'Rastreie aberturas, cliques, bounces e descadastros de cada campanha com gráficos detalhados e exportação de relatório.',
      accent: 'emerald',
    },
    {
      title: 'Agendamento de campanhas',
      description:
        'Agende envios para o momento ideal — horas, dias ou semanas à frente — e maximize a taxa de abertura.',
      accent: 'amber',
    },
    {
      title: 'Envio em massa com personalização',
      description:
        'Envie para centenas de jornalistas de uma só vez. Cada e-mail pode ser personalizado com o nome do jornalista e veículo.',
      accent: 'cyan',
    },
  ],
}

export const JOURNALIST_CTA_FALLBACK: JournalistCtaContent = {
  badge: 'Para Jornalistas',
  titleLine1: 'É jornalista?',
  titleLine2: 'Faça parte da nossa base',
  description:
    'Registe-se gratuitamente e receba press releases de empresas angolanas directamente na sua caixa de entrada. O cadastro é aprovado pelo nosso administrador.',
  secondaryCtaLabel: 'Saiba mais',
  secondaryCtaUrl: '#para-quem',
}

// ── Fetch ────────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 1500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

export async function getLandingContent(): Promise<LandingContent> {
  try {
    const base = process.env.WP_URL ?? 'http://angopress.local'
    const res = await fetchWithTimeout(`${base}/wp-json/angopress/v1/landing`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`WP API ${res.status}`)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json()
    const h = raw.hero ?? {}
    const a = raw.about ?? {}
    const n = raw.news ?? {}
    const hiw = raw.how_it_works ?? {}
    const jc = raw.journalist_cta ?? {}
    const pr = raw.pricing ?? {}

    return {
      hero: {
        badge: h.badge ?? HERO_FALLBACK.badge,
        headlineLine1: h.headline_line1 ?? HERO_FALLBACK.headlineLine1,
        headlineLine2: h.headline_line2 ?? HERO_FALLBACK.headlineLine2,
        subtitle: h.subtitle ?? HERO_FALLBACK.subtitle,
        ctaPrimaryLabel: h.cta_primary_label ?? HERO_FALLBACK.ctaPrimaryLabel,
        ctaPrimaryUrl: h.cta_primary_url ?? HERO_FALLBACK.ctaPrimaryUrl,
        ctaSecondaryLabel: h.cta_secondary_label ?? HERO_FALLBACK.ctaSecondaryLabel,
        ctaSecondaryUrl: h.cta_secondary_url ?? HERO_FALLBACK.ctaSecondaryUrl,
      },
      about: {
        sectionLabel: a.section_label ?? ABOUT_FALLBACK.sectionLabel,
        title: a.title ?? ABOUT_FALLBACK.title,
        paragraph1: a.paragraph_1 ?? ABOUT_FALLBACK.paragraph1,
        paragraph2: a.paragraph_2 ?? ABOUT_FALLBACK.paragraph2,
        paragraph3: a.paragraph_3 ?? ABOUT_FALLBACK.paragraph3,
        pillars:
          Array.isArray(a.pillars) && a.pillars.length
            ? (a.pillars as AboutPillar[])
            : ABOUT_FALLBACK.pillars,
      },
      news: {
        sectionLabel: n.section_label ?? NEWS_FALLBACK.sectionLabel,
        title: n.title ?? NEWS_FALLBACK.title,
        description: n.description ?? NEWS_FALLBACK.description,
        badge: n.badge ?? NEWS_FALLBACK.badge,
        articles:
          Array.isArray(n.articles) && n.articles.length
            ? n.articles.map((art: Record<string, string>) => ({
                slug: art.slug ?? '',
                category: art.category ?? '',
                title: art.title ?? '',
                excerpt: art.excerpt ?? '',
                readTime: art.read_time ?? '5 min',
                url: art.url ?? '',
                accent: (art.accent as NewsArticle['accent']) ?? 'brand',
                imageUrl: art.image_url ?? '',
                publishedAt: art.published_at ?? '',
              }))
            : NEWS_FALLBACK.articles,
      },
      howItWorks: {
        sectionLabel: hiw.section_label ?? HOW_IT_WORKS_FALLBACK.sectionLabel,
        title: hiw.title ?? HOW_IT_WORKS_FALLBACK.title,
        subtitle: hiw.subtitle ?? HOW_IT_WORKS_FALLBACK.subtitle,
        featuresTitle: hiw.features_title ?? HOW_IT_WORKS_FALLBACK.featuresTitle,
        ctaLabel: hiw.cta_label ?? HOW_IT_WORKS_FALLBACK.ctaLabel,
        ctaUrl: hiw.cta_url ?? HOW_IT_WORKS_FALLBACK.ctaUrl,
        steps:
          Array.isArray(hiw.steps) && hiw.steps.length
            ? hiw.steps.map((s: Record<string, string>) => ({
                title: s.title ?? '',
                description: s.description ?? '',
                accent: (s.accent as HowItWorksStep['accent']) ?? 'brand',
              }))
            : HOW_IT_WORKS_FALLBACK.steps,
        features:
          Array.isArray(hiw.features) && hiw.features.length
            ? hiw.features.map((f: Record<string, string>) => ({
                title: f.title ?? '',
                description: f.description ?? '',
                accent: (f.accent as HowItWorksFeature['accent']) ?? 'brand',
              }))
            : HOW_IT_WORKS_FALLBACK.features,
      },
      journalistCta: {
        badge: jc.badge ?? JOURNALIST_CTA_FALLBACK.badge,
        titleLine1: jc.title_line1 ?? JOURNALIST_CTA_FALLBACK.titleLine1,
        titleLine2: jc.title_line2 ?? JOURNALIST_CTA_FALLBACK.titleLine2,
        description: jc.description ?? JOURNALIST_CTA_FALLBACK.description,
        secondaryCtaLabel: jc.secondary_cta_label ?? JOURNALIST_CTA_FALLBACK.secondaryCtaLabel,
        secondaryCtaUrl: jc.secondary_cta_url ?? JOURNALIST_CTA_FALLBACK.secondaryCtaUrl,
      },
      pricing: {
        sectionLabel: pr.section_label ?? PRICING_FALLBACK.sectionLabel,
        title: pr.title ?? PRICING_FALLBACK.title,
        description: pr.description ?? PRICING_FALLBACK.description,
        paymentTitle: pr.payment_title ?? PRICING_FALLBACK.paymentTitle,
        paymentDescription: pr.payment_description ?? PRICING_FALLBACK.paymentDescription,
      },
    }
  } catch {
    return {
      hero: HERO_FALLBACK,
      about: ABOUT_FALLBACK,
      news: NEWS_FALLBACK,
      howItWorks: HOW_IT_WORKS_FALLBACK,
      journalistCta: JOURNALIST_CTA_FALLBACK,
      pricing: PRICING_FALLBACK,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArticlePreview(a: any): NewsArticlePreview {
  return {
    slug: a?.slug ?? '',
    title: a?.title ?? '',
    category: a?.category ?? '',
    imageUrl: a?.image_url ?? '',
    publishedAt: a?.published_at ?? '',
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticleFull | null> {
  try {
    const base = process.env.WP_URL ?? 'http://angopress.local'
    const res = await fetchWithTimeout(
      `${base}/wp-json/angopress/v1/news/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 300 },
      },
    )
    if (!res.ok) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const art: any = await res.json()
    return {
      slug: art.slug ?? slug,
      category: art.category ?? '',
      title: art.title ?? '',
      excerpt: art.excerpt ?? '',
      content: art.content ?? '',
      readTime: art.read_time ?? '5 min',
      url: art.url ?? '',
      accent: (art.accent as NewsArticle['accent']) ?? 'brand',
      imageUrl: art.image_url ?? '',
      publishedAt: art.published_at ?? '',
      prev: art.prev ? mapArticlePreview(art.prev) : null,
      next: art.next ? mapArticlePreview(art.next) : null,
      related: Array.isArray(art.related) ? art.related.map(mapArticlePreview) : [],
      recent: Array.isArray(art.recent) ? art.recent.map(mapArticlePreview) : [],
    }
  } catch {
    return null
  }
}

export interface NewsListResult {
  articles: NewsArticle[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export async function getAllNews(page = 1, perPage = 12): Promise<NewsListResult> {
  try {
    const base = process.env.WP_URL ?? 'http://angopress.local'
    const res = await fetchWithTimeout(
      `${base}/wp-json/angopress/v1/news?page=${page}&per_page=${perPage}`,
      {
        next: { revalidate: 120 },
      },
    )
    if (!res.ok) throw new Error(`WP API ${res.status}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await res.json()
    const articles: NewsArticle[] = (raw.articles ?? []).map((art: Record<string, string>) => ({
      slug: art.slug ?? '',
      category: art.category ?? '',
      title: art.title ?? '',
      excerpt: art.excerpt ?? '',
      readTime: art.read_time ?? '5 min',
      url: art.url ?? '',
      accent: (art.accent as NewsArticle['accent']) ?? 'brand',
      imageUrl: art.image_url ?? '',
      publishedAt: art.published_at ?? '',
    }))
    return {
      articles,
      total: raw.total ?? articles.length,
      totalPages: raw.total_pages ?? 1,
      page: raw.page ?? page,
      perPage: raw.per_page ?? perPage,
    }
  } catch {
    return {
      articles: NEWS_FALLBACK.articles,
      total: NEWS_FALLBACK.articles.length,
      totalPages: 1,
      page: 1,
      perPage,
    }
  }
}
