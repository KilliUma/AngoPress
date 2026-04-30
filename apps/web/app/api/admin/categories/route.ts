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

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const categories = await prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error

    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const slug = String(body.slug ?? slugify(name)).trim()

    if (!name || !slug) {
      return NextResponse.json({ message: 'Nome da categoria é obrigatório' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body.description?.trim() || null,
        isActive: body.isActive ?? true,
        sortOrder: Number(body.sortOrder ?? 0),
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'Já existe uma categoria com este nome ou slug'
        : 'Erro interno do servidor'
    return NextResponse.json({ message }, { status: message.startsWith('Já existe') ? 409 : 500 })
  }
}
