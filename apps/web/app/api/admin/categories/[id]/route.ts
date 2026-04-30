import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function requireAdmin(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser)
    return { error: NextResponse.json({ message: 'Não autenticado' }, { status: 401 }) }
  if (authUser.role !== 'ADMIN') {
    return { error: NextResponse.json({ message: 'Sem permissão' }, { status: 403 }) }
  }
  return { authUser }
}

// PATCH /api/admin/categories/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    const { id } = await params

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category)
      return NextResponse.json({ message: 'Categoria não encontrada' }, { status: 404 })

    const body = await request.json()
    const name = body.name === undefined ? undefined : String(body.name).trim()
    const slug =
      body.slug === undefined ? (name ? slugify(name) : undefined) : String(body.slug).trim()

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'Já existe uma categoria com este nome ou slug'
        : 'Erro interno do servidor'
    return NextResponse.json({ message }, { status: message.startsWith('Já existe') ? 409 : 500 })
  }
}

// DELETE /api/admin/categories/[id] — soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    const { id } = await params

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category)
      return NextResponse.json({ message: 'Categoria não encontrada' }, { status: 404 })

    await prisma.category.update({ where: { id }, data: { isActive: false } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
