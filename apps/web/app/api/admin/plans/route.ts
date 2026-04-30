import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/admin/plans
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })

    const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(plans)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/admin/plans
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const {
      name,
      description,
      priceMonthlyAoa,
      priceYearlyAoa,
      maxSendsMonth,
      features,
      sortOrder,
    } = body

    if (!name || maxSendsMonth == null) {
      return NextResponse.json(
        { message: 'name e maxSendsMonth são obrigatórios' },
        { status: 400 },
      )
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description: description ?? null,
        priceMonthlyAoa: priceMonthlyAoa ?? 0,
        priceYearlyAoa: priceYearlyAoa ?? null,
        maxSendsMonth,
        features: features ?? [],
        sortOrder: sortOrder ?? 0,
        isActive: true,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
