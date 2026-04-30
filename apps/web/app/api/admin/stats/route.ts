import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/admin/stats
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })

    const [
      totalUsers,
      activeUsers,
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalSends,
      totalJournalists,
      totalPressReleases,
      activeSubscriptionRows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.campaign.count({ where: { status: 'SENT' } }),
      prisma.subscription.aggregate({ _sum: { sendsUsed: true } }),
      prisma.journalist.count(),
      prisma.pressRelease.count(),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { plan: { select: { priceMonthlyAoa: true } } },
      }),
    ])

    const monthlyRevenueAoa = activeSubscriptionRows.reduce(
      (sum, sub) => sum + Number(sub.plan.priceMonthlyAoa),
      0,
    )

    return NextResponse.json({
      totalUsers,
      activeUsers,
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalSends: totalSends._sum.sendsUsed ?? 0,
      totalJournalists,
      totalPressReleases,
      monthlyRevenueAoa,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
