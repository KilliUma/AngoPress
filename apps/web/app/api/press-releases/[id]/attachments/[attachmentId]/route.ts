import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { deleteFromS3 } from '@/lib/s3'

// DELETE /api/press-releases/[id]/attachments/[attachmentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id, attachmentId } = await params

    const pr = await prisma.pressRelease.findUnique({ where: { id } })
    if (!pr) return NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 })
    if (pr.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const att = await prisma.pressReleaseAttachment.findUnique({ where: { id: attachmentId } })
    if (!att || att.pressReleaseId !== id) {
      return NextResponse.json({ message: 'Anexo não encontrado' }, { status: 404 })
    }

    const key = att.fileUrl.split('.amazonaws.com/')[1] ?? att.fileUrl
    await deleteFromS3(key).catch(() => {})

    await prisma.pressReleaseAttachment.delete({ where: { id: attachmentId } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
