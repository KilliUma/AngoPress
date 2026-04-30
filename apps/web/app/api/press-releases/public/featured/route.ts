import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/press-releases/public/featured — sem autenticação
export async function GET(_request: NextRequest) {
  try {
    const data = await prisma.pressRelease.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        summary: true,
        publishedAt: true,
        user: { select: { name: true, company: true } },
      },
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
