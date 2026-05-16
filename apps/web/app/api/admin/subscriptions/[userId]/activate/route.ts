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

    if (!sub && !planId) {
      return NextResponse.json(
        { message: 'planId é obrigatório para criar uma assinatura' },
        { status: 400 },
      )
    }

    const effectivePlanId = planId ?? sub!.planId
    const plan = planId
      ? await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
      : sub!.plan

    if (!plan) return NextResponse.json({ message: 'Plano não encontrado' }, { status: 404 })
    const now = new Date()
    const effectiveExpiresAt = expiresAt
      ? new Date(expiresAt)
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    const updated = sub
      ? await prisma.subscription.update({
          where: { userId },
          data: {
            planId: effectivePlanId,
            status: 'ACTIVE',
            activatedAt: now,
            expiresAt: effectiveExpiresAt,
            periodStart: now,
            periodEnd: effectiveExpiresAt,
            sendsUsed: 0,
            adminNotes: adminNotes ?? null,
          },
          include: { plan: true },
        })
      : await prisma.subscription.create({
          data: {
            userId,
            planId: effectivePlanId,
            status: 'ACTIVE',
            activatedAt: now,
            expiresAt: effectiveExpiresAt,
            periodStart: now,
            periodEnd: effectiveExpiresAt,
            adminNotes: adminNotes ?? null,
          },
          include: { plan: true },
        })

    if (user.status === 'PENDING') {
      await prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } })
    }

    // Enviar e-mail de confirmação
    try {
      const admin = await prisma.user.findUnique({
        where: { id: authUser.sub },
        select: { emailSignatureText: true, emailSignatureImageUrl: true },
      })

      await sendSubscriptionActivatedEmail({
        toEmail: user.email,
        toName: user.name,
        planName: plan.name,
        expiresAt: updated.expiresAt ?? effectiveExpiresAt,
        sendsPerMonth: plan.maxSendsMonth,
        signature: {
          text: admin?.emailSignatureText,
          imageUrl: admin?.emailSignatureImageUrl,
        },
      })
    } catch (error) {
      console.error('[subscription-activate] Falha ao enviar email de confirmação', {
        userId,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      })
      // falha no envio de e-mail não deve bloquear a ativação
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[subscription-activate] Erro interno', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    })
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
