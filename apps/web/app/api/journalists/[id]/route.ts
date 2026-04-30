import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/journalists/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const journalist = await prisma.journalist.findUnique({ where: { id } })
    if (!journalist)
      return NextResponse.json({ message: 'Jornalista não encontrado' }, { status: 404 })
    return NextResponse.json(journalist)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/journalists/[id] — apenas ADMIN
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    const { id } = await params

    const existing = await prisma.journalist.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ message: 'Jornalista não encontrado' }, { status: 404 })

    const body = await request.json()
    const { email } = body

    if (email) {
      const dup = await prisma.journalist.findFirst({
        where: { email: email.toLowerCase(), NOT: { id } },
      })
      if (dup)
        return NextResponse.json({ message: 'Este email já está registado' }, { status: 409 })
    }

    const data: Record<string, unknown> = { ...body }
    if (email) data.email = email.toLowerCase()

    const updated = await prisma.journalist.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/journalists/[id] — apenas ADMIN
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
    const { id } = await params

    const existing = await prisma.journalist.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json({ message: 'Jornalista não encontrado' }, { status: 404 })

    await prisma.journalist.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
