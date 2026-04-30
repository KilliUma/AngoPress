import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { sendSubscriptionActivatedEmail } from '@/lib/email'

// POST /api/admin/subscriptions/[userId]/activate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    const { userId } = await params

    const body = await request.json()
    const { planId, expiresAt, adminNotes } = body

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ message: 'Utilizador não encontrado' }, { status: 404 })

    const sub = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })
    if (!sub) return NextResponse.json({ message: 'Assinatura não encontrada' }, { status: 404 })

    const effectivePlanId = planId ?? sub.planId
    const plan = planId
      ? await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
      : sub.plan

    if (!plan) return NextResponse.json({ message: 'Plano não encontrado' }, { status: 404 })

    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        planId: effectivePlanId,
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        sendsUsed: 0,
        adminNotes: adminNotes ?? null,
      },
      include: { plan: true },
    })

    // Enviar e-mail de confirmação
    try {
      await sendSubscriptionActivatedEmail({
        toEmail: user.email,
        toName: user.name,
        planName: plan.name,
        expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
        sendsPerMonth: plan.maxSendsMonth,
      })
    } catch {
      // falha no envio de e-mail não deve bloquear a ativação
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
