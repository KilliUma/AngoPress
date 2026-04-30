import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/admin/notifications
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })

    const [pendingSubscriptions, pendingJournalistRegistrations] = await Promise.all([
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.journalistRegistration.count({ where: { status: 'PENDING' } }),
    ])

    return NextResponse.json({ pendingSubscriptions, pendingJournalistRegistrations })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
