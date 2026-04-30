import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// PATCH /api/admin/plans/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) return NextResponse.json({ message: 'Plano não encontrado' }, { status: 404 })

    const body = await request.json()
    const updated = await prisma.subscriptionPlan.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/plans/[id] — soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) return NextResponse.json({ message: 'Plano não encontrado' }, { status: 404 })

    await prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
