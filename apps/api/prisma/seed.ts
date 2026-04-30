import { PrismaClient, UserRole, UserStatus, MediaType } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // ─── Planos de Assinatura ───────────────────────────────────────────
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Básico' },
    update: {},
    create: {
      name: 'Básico',
      description: 'Para pequenas empresas e profissionais independentes',
      maxSendsMonth: 1000,
      priceMonthlyAoa: 15000,
      features: [
        'Acesso à plataforma',
        'Até 1.000 envios/mês',
        'Base básica de jornalistas',
        'Segmentação simples',
        'Relatórios básicos',
      ],
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Profissional' },
    update: {},
    create: {
      name: 'Profissional',
      description: 'Para assessorias e empresas médias',
      maxSendsMonth: 5000,
      priceMonthlyAoa: 45000,
      priceYearlyAoa: 480000,
      features: [
        'Até 5.000 envios/mês',
        'Segmentação avançada',
        'Acesso completo à base',
        'Relatórios detalhados',
        'Agendamento de campanhas',
        'Personalização de envios',
      ],
      sortOrder: 2,
    },
  })

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Empresarial' },
    update: {},
    create: {
      name: 'Empresarial',
      description: 'Para grandes empresas, agências e instituições',
      maxSendsMonth: 20000,
      priceMonthlyAoa: 120000,
      priceYearlyAoa: 1200000,
      features: [
        'Até 20.000+ envios/mês',
        'Suporte prioritário',
        'Relatórios avançados',
        'Gestão de múltiplos utilizadores',
        'Exportação PDF',
        'API dedicada',
      ],
      sortOrder: 3,
    },
  })

  console.log('Planos criados:', {
    basicPlan: basicPlan.name,
    proPlan: proPlan.name,
    enterprisePlan: enterprisePlan.name,
  })

  // ─── Administrador ───────────────────────────────────────────────────
  const adminPassword = await hash('Admin@AngoPress2026!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@angopress.ao' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@angopress.ao',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      company: 'AngoPress',
    },
  })

  // ─── Cliente de Teste ─────────────────────────────────────────────────
  const clientPassword = await hash('Cliente@123!', 12)
  const client = await prisma.user.upsert({
    where: { email: 'demo@empresa.ao' },
    update: {},
    create: {
      name: 'Empresa Demo',
      email: 'demo@empresa.ao',
      passwordHash: clientPassword,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
      company: 'Empresa Demonstração Lda.',
      subscription: {
        create: {
          planId: proPlan.id,
          status: 'ACTIVE',
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  })

  console.log('Utilizadores criados:', { admin: admin.email, client: client.email })

  // ─── Categorias / Editorias ─────────────────────────────────────────
  const categorySeeds = [
    ['Economia', 'economia'],
    ['Política', 'politica'],
    ['Tecnologia', 'tecnologia'],
    ['Saúde', 'saude'],
    ['Desporto', 'desporto'],
    ['Cultura', 'cultura'],
    ['Sociedade', 'sociedade'],
    ['Negócios', 'negocios'],
    ['Internacional', 'internacional'],
    ['Educação', 'educacao'],
  ] as const

  await Promise.all(
    categorySeeds.map(([name, slug], index) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, sortOrder: index + 1, isActive: true },
        create: { name, slug, sortOrder: index + 1 },
      }),
    ),
  )

  console.log(`${categorySeeds.length} categorias criadas.`)

  // ─── Jornalistas de Exemplo ────────────────────────────────────────────
  const journalists = await Promise.all([
    prisma.journalist.upsert({
      where: { email: 'maria.silva@tv.ao' },
      update: {},
      create: {
        name: 'Maria Silva',
        email: 'maria.silva@tv.ao',
        outlet: 'TPA — Televisão Pública de Angola',
        jobTitle: 'Repórter de Economia',
        coverageArea: ['economia', 'finanças', 'negócios'],
        mediaType: MediaType.TV,
        city: 'Luanda',
        province: 'Luanda',
      },
    }),
    prisma.journalist.upsert({
      where: { email: 'joao.manuel@jornalangola.ao' },
      update: {},
      create: {
        name: 'João Manuel',
        email: 'joao.manuel@jornalangola.ao',
        outlet: 'Jornal de Angola',
        jobTitle: 'Editor de Política',
        coverageArea: ['política', 'governo', 'sociedade'],
        mediaType: MediaType.PRINT,
        city: 'Luanda',
        province: 'Luanda',
      },
    }),
    prisma.journalist.upsert({
      where: { email: 'ana.pedro@expansao.ao' },
      update: {},
      create: {
        name: 'Ana Pedro',
        email: 'ana.pedro@expansao.ao',
        outlet: 'Expansão',
        jobTitle: 'Jornalista de Tecnologia',
        coverageArea: ['tecnologia', 'startups', 'inovação'],
        mediaType: MediaType.DIGITAL,
        city: 'Luanda',
        province: 'Luanda',
      },
    }),
    prisma.journalist.upsert({
      where: { email: 'carlos.neto@radioangola.ao' },
      update: {},
      create: {
        name: 'Carlos Neto',
        email: 'carlos.neto@radioangola.ao',
        outlet: 'Rádio Nacional de Angola',
        jobTitle: 'Apresentador de Notícias',
        coverageArea: ['geral', 'saúde', 'educação'],
        mediaType: MediaType.RADIO,
        city: 'Huambo',
        province: 'Huambo',
      },
    }),
  ])

  console.log(`${journalists.length} jornalistas criados.`)
  console.log('\nSeed concluído com sucesso!')
  console.log('\n────────────────────────────────────────')
  console.log('Credenciais de acesso:')
  console.log(`Admin: admin@angopress.ao / Admin@AngoPress2026!`)
  console.log(`Demo:  demo@empresa.ao / Cliente@123!`)
  console.log('────────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
