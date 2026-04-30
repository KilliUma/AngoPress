import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// PATCH /api/admin/users/[id]/status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const body = await request.json()
    const { status } = body

    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Status inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ message: 'Utilizador não encontrado' }, { status: 404 })

    const updated = await prisma.user.update({ where: { id }, data: { status } })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
