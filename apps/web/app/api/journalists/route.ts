import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/journalists
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? undefined
    const mediaType = searchParams.get('mediaType') ?? undefined
    const coverageArea = searchParams.get('coverageArea') ?? undefined
    const isActive = searchParams.get('isActive') ?? undefined
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 20)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { outlet: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (mediaType) where.mediaType = mediaType
    if (coverageArea) where.coverageArea = { has: coverageArea }
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const [data, total] = await Promise.all([
      prisma.journalist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.journalist.count({ where }),
    ])

    return NextResponse.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/journalists — apenas ADMIN
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const {
      name,
      email,
      outlet,
      jobTitle,
      mediaType,
      coverageArea,
      city,
      province,
      phone,
      isActive,
    } = body

    if (!name || !email || !outlet || !mediaType) {
      return NextResponse.json({ message: 'Campos obrigatórios em falta' }, { status: 400 })
    }

    const existing = await prisma.journalist.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ message: 'Este email já está registado' }, { status: 409 })
    }

    const journalist = await prisma.journalist.create({
      data: {
        name,
        email: email.toLowerCase(),
        outlet,
        jobTitle: jobTitle ?? null,
        mediaType,
        coverageArea: coverageArea ?? [],
        city: city ?? null,
        province: province ?? null,
        phone: phone ?? null,
        isActive: isActive ?? true,
        country: 'Angola',
      },
    })

    return NextResponse.json(journalist, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
