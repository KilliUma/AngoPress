import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

async function findAndAuthorize(id: string, userId: string, role: string, full = false) {
  const list = await prisma.mailingList.findUnique({
    where: { id },
    include: full
      ? {
          contacts: {
            include: { journalist: true },
            orderBy: { addedAt: 'desc' },
          },
          _count: { select: { contacts: true } },
        }
      : { _count: { select: { contacts: true } } },
  })
  if (!list)
    return {
      list: null,
      error: NextResponse.json({ message: 'Lista não encontrada' }, { status: 404 }),
    }
  if (list.userId !== userId && role !== 'ADMIN') {
    return { list: null, error: NextResponse.json({ message: 'Sem permissão' }, { status: 403 }) }
  }
  return { list, error: null }
}

// GET /api/mailing-lists/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { list, error } = await findAndAuthorize(id, authUser.sub, authUser.role, true)
    if (error) return error
    return NextResponse.json(list)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/mailing-lists/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { error } = await findAndAuthorize(id, authUser.sub, authUser.role)
    if (error) return error

    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description

    const updated = await prisma.mailingList.update({
      where: { id },
      data,
      include: { _count: { select: { contacts: true } } },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/mailing-lists/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { error } = await findAndAuthorize(id, authUser.sub, authUser.role)
    if (error) return error

    await prisma.mailingList.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
