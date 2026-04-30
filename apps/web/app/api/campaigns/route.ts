import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/campaigns
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 20)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (authUser.role !== 'ADMIN') where.userId = authUser.sub
    if (status) where.status = status
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [data, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pressRelease: { select: { id: true, title: true } },
          _count: { select: { recipients: true, emailEvents: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/campaigns
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const {
      pressReleaseId,
      name,
      subject,
      journalistIds = [],
      mailingListIds = [],
      scheduledAt,
    } = body

    if (!pressReleaseId || !name || !subject) {
      return NextResponse.json(
        { message: 'pressReleaseId, name e subject são obrigatórios' },
        { status: 400 },
      )
    }

    // Verificar press release
    const pr = await prisma.pressRelease.findFirst({
      where: { id: pressReleaseId, userId: authUser.sub },
    })
    if (!pr) return NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 })

    // Resolver jornalistas únicos
    const allJournalistIds = new Set<string>(journalistIds)

    if (mailingListIds.length) {
      const listContacts = await prisma.mailingListContact.findMany({
        where: { listId: { in: mailingListIds } },
        select: { journalistId: true },
      })
      listContacts.forEach((c) => allJournalistIds.add(c.journalistId))
    }

    if (allJournalistIds.size === 0) {
      return NextResponse.json(
        { message: 'A campanha precisa de pelo menos um destinatário' },
        { status: 400 },
      )
    }

    // Filtrar jornalistas activos e sem opt-out
    const validJournalists = await prisma.journalist.findMany({
      where: { id: { in: [...allJournalistIds] }, isActive: true, isOptedOut: false },
      select: { id: true },
    })

    if (validJournalists.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum destinatário válido (activo e sem opt-out)' },
        { status: 400 },
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: authUser.sub,
        pressReleaseId,
        name,
        subject,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalRecipients: validJournalists.length,
        recipients: {
          create: validJournalists.map((j) => ({ journalistId: j.id })),
        },
      },
      include: {
        pressRelease: { select: { id: true, title: true } },
        _count: { select: { recipients: true } },
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
