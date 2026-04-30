import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { uploadToS3 } from '@/lib/s3'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// POST /api/press-releases/[id]/attachments
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const pr = await prisma.pressRelease.findUnique({ where: { id } })
    if (!pr) return NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 })
    if (pr.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ message: 'Ficheiro não encontrado' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Tipo de ficheiro não permitido: ${file.type}` },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await uploadToS3(buffer, file.name, file.type, 'press-releases')

    const attachment = await prisma.pressReleaseAttachment.create({
      data: {
        pressReleaseId: id,
        fileName: file.name,
        fileUrl: url,
        fileType: file.type,
        fileSize: buffer.length,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
