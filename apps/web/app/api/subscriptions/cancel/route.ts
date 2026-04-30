import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// DELETE /api/subscriptions/cancel
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })

    const sub = await prisma.subscription.findUnique({ where: { userId: authUser.sub } })
    if (!sub) return NextResponse.json({ message: 'Assinatura não encontrada' }, { status: 404 })
    if (sub.status === 'CANCELLED') {
      return NextResponse.json({ message: 'Assinatura já cancelada' }, { status: 400 })
    }

    const updated = await prisma.subscription.update({
      where: { userId: authUser.sub },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
