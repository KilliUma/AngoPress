import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/press-releases
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
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.pressRelease.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          attachments: { orderBy: { createdAt: 'asc' } },
          _count: { select: { campaigns: true } },
        },
      }),
      prisma.pressRelease.count({ where }),
    ])

    return NextResponse.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/press-releases
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { title, content, summary, status, scheduledAt } = body

    if (!title || !content) {
      return NextResponse.json({ message: 'Título e conteúdo são obrigatórios' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      title,
      content,
      summary: summary ?? null,
      status: status ?? 'DRAFT',
      userId: authUser.sub,
    }

    if (scheduledAt) {
      data.scheduledAt = new Date(scheduledAt)
      data.status = 'SCHEDULED'
    }

    const pr = await prisma.pressRelease.create({
      data: data as Parameters<typeof prisma.pressRelease.create>[0]['data'],
      include: { attachments: true },
    })

    return NextResponse.json(pr, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
