import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/public-stats — público
export async function GET() {
  try {
    const [totalJournalists, totalCampaignsSent, activeCompanies, journalists] = await Promise.all([
      prisma.journalist.count({ where: { isActive: true } }),
      prisma.campaign.count({ where: { status: 'SENT' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.journalist.findMany({
        where: { isActive: true },
        select: { name: true },
        take: 6,
      }),
    ])

    const journalistInitials = journalists.map((j) => {
      const parts = j.name.trim().split(' ')
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase()
    })

    return NextResponse.json({
      totalJournalists,
      totalCampaignsSent,
      activeCompanies,
      journalistInitials,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
