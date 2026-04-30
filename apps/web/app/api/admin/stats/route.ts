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
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalJournalists,
      totalPressReleases,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.campaign.count({ where: { status: 'SENT' } }),
      prisma.journalist.count(),
      prisma.pressRelease.count(),
    ])

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      pendingSubscriptions,
      totalCampaignsSent,
      totalJournalists,
      totalPressReleases,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
