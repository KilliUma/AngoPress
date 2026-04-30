import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

async function findAndAuthorize(id: string, userId: string, role: string) {
  const pr = await prisma.pressRelease.findUnique({
    where: { id },
    include: { attachments: { orderBy: { createdAt: 'asc' } } },
  })
  if (!pr)
    return {
      pr: null,
      error: NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 }),
    }
  if (pr.userId !== userId && role !== 'ADMIN') {
    return { pr: null, error: NextResponse.json({ message: 'Sem permissão' }, { status: 403 }) }
  }
  return { pr, error: null }
}

// GET /api/press-releases/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { pr, error } = await findAndAuthorize(id, authUser.sub, authUser.role)
    if (error) return error
    return NextResponse.json(pr)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/press-releases/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { error } = await findAndAuthorize(id, authUser.sub, authUser.role)
    if (error) return error

    const body = await request.json()
    const { title, content, summary, status, scheduledAt } = body

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (summary !== undefined) data.summary = summary
    if (status !== undefined) data.status = status
    if (scheduledAt !== undefined) {
      data.scheduledAt = new Date(scheduledAt)
      if (status === undefined) data.status = 'SCHEDULED'
    }

    const updated = await prisma.pressRelease.update({
      where: { id },
      data,
      include: { attachments: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/press-releases/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params
    const { pr, error } = await findAndAuthorize(id, authUser.sub, authUser.role)
    if (error) return error

    // Eliminar anexos S3
    const { deleteFromS3 } = await import('@/lib/s3')
    for (const att of pr!.attachments) {
      const key = att.fileUrl.split('.amazonaws.com/')[1] ?? att.fileUrl
      await deleteFromS3(key).catch(() => {})
    }

    await prisma.pressRelease.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
