import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/subscriptions/my
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const sub = await prisma.subscription.findUnique({
      where: { userId: authUser.sub },
      include: { plan: true },
    })
    if (!sub) return NextResponse.json(null)

    if (sub.status === 'ACTIVE' && sub.expiresAt && sub.expiresAt < new Date()) {
      const expired = await prisma.subscription.update({
        where: { userId: authUser.sub },
        data: { status: 'EXPIRED' },
        include: { plan: true },
      })
      return NextResponse.json({ ...expired, sendsRemaining: 0 })
    }

    const sendsRemaining = sub.plan ? Math.max(0, sub.plan.maxSendsMonth - sub.sendsUsed) : 0
    return NextResponse.json({ ...sub, sendsRemaining })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
