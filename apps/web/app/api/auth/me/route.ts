import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { hash, compare } from 'bcrypt'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.sub } })
    if (!user) {
      return NextResponse.json({ message: 'Utilizador não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      company: user.company,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company, phone, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({ where: { id: authUser.sub } })
    if (!user) {
      return NextResponse.json({ message: 'Utilizador não encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { message: 'Nome inválido (mínimo 2 caracteres)' },
          { status: 400 },
        )
      }
      updateData.name = name.trim()
    }

    if (company !== undefined) updateData.company = company?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null

    // Alteração de password
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json({ message: 'Password actual obrigatória' }, { status: 400 })
      }
      const valid = await compare(currentPassword, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ message: 'Password actual incorrecta' }, { status: 400 })
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: 'Nova password deve ter pelo menos 8 caracteres' },
          { status: 400 },
        )
      }
      updateData.passwordHash = await hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: authUser.sub },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      company: updated.company,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      createdAt: updated.createdAt,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
