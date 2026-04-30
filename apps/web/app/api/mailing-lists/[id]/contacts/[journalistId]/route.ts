import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// DELETE /api/mailing-lists/[id]/contacts/[journalistId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; journalistId: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id, journalistId } = await params

    const list = await prisma.mailingList.findUnique({ where: { id } })
    if (!list) return NextResponse.json({ message: 'Lista não encontrada' }, { status: 404 })
    if (list.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    await prisma.mailingListContact.deleteMany({ where: { listId: id, journalistId } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
