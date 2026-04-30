import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/journalists/export — exporta CSV (admin only)
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })

    const journalists = await prisma.journalist.findMany({
      orderBy: { name: 'asc' },
    })

    const header = [
      'name',
      'email',
      'outlet',
      'jobTitle',
      'mediaType',
      'coverageArea',
      'city',
      'province',
      'country',
      'phone',
      'isActive',
    ].join(',')

    const rows = journalists.map((j) =>
      [
        `"${j.name.replace(/"/g, '""')}"`,
        `"${j.email}"`,
        `"${j.outlet.replace(/"/g, '""')}"`,
        `"${(j.jobTitle ?? '').replace(/"/g, '""')}"`,
        j.mediaType,
        `"${j.coverageArea.join(';')}"`,
        `"${(j.city ?? '').replace(/"/g, '""')}"`,
        `"${(j.province ?? '').replace(/"/g, '""')}"`,
        `"${j.country}"`,
        `"${(j.phone ?? '').replace(/"/g, '""')}"`,
        j.isActive ? 'true' : 'false',
      ].join(','),
    )

    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jornalistas-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/journalists/export  — não usado, apenas GET
