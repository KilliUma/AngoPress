import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// POST /api/subscriptions/request
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json({ message: 'planId é obrigatório' }, { status: 400 })
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan || !plan.isActive) {
      return NextResponse.json({ message: 'Plano não encontrado ou inactivo' }, { status: 404 })
    }

    const existing = await prisma.subscription.findUnique({ where: { userId: authUser.sub } })

    let sub
    if (existing) {
      sub = await prisma.subscription.update({
        where: { userId: authUser.sub },
        data: { planId, status: 'PENDING' },
        include: { plan: true },
      })
    } else {
      sub = await prisma.subscription.create({
        data: { userId: authUser.sub, planId, status: 'PENDING' },
        include: { plan: true },
      })
    }

    return NextResponse.json(sub)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
