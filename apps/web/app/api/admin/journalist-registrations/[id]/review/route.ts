import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// POST /api/admin/journalist-registrations/[id]/review
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const body = await request.json()
    const { status } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ message: 'Status deve ser APPROVED ou REJECTED' }, { status: 400 })
    }

    const registration = await prisma.journalistRegistration.findUnique({ where: { id } })
    if (!registration)
      return NextResponse.json({ message: 'Registo não encontrado' }, { status: 404 })

    // Se aprovado, criar ou actualizar jornalista
    if (status === 'APPROVED') {
      const existing = await prisma.journalist.findFirst({ where: { email: registration.email } })
      if (!existing) {
        await prisma.journalist.create({
          data: {
            name: registration.name,
            email: registration.email,
            outlet: registration.outlet,
            jobTitle: registration.jobTitle ?? null,
            mediaType: registration.mediaType,
            city: registration.city ?? null,
            isActive: true,
          },
        })
      }
    }

    const updated = await prisma.journalistRegistration.update({
      where: { id },
      data: {
        status,
        reviewedBy: authUser.sub,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
