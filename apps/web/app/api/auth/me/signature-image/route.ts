import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { uploadToS3 } from '@/lib/s3'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}
const MAX_IMAGE_SIZE = 2 * 1024 * 1024

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    'name' in value &&
    'size' in value &&
    'type' in value
  )
}

function getImageMimeType(file: File): string {
  if (file.type) return file.type
  const extension = String(file.name).split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TO_MIME_TYPE[extension] ?? ''
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.sub } })
    if (!user) {
      return NextResponse.json({ message: 'Utilizador não encontrado' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Apenas administradores podem editar a assinatura' },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!isUploadedFile(file)) {
      return NextResponse.json({ message: 'Imagem obrigatória' }, { status: 400 })
    }

    const mimeType = getImageMimeType(file)

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          message: 'Tipo de imagem não permitido. Use PNG, JPG, WEBP ou GIF.',
        },
        { status: 400 },
      )
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: 'Imagem demasiado grande. Máximo: 2MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let uploaded: { url: string }
    try {
      uploaded = await uploadToS3(buffer, file.name, mimeType, 'email-signatures')
    } catch (error) {
      console.error('[signature-image] Falha no upload da imagem', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      })
      return NextResponse.json(
        { message: 'Falha ao carregar imagem. Verifique a configuração do S3.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ url: uploaded.url })
  } catch (error) {
    console.error('[signature-image] Erro interno', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    })
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
