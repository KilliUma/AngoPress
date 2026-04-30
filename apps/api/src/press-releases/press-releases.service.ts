import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { S3Service } from '@/uploads/s3.service'
import { CreatePressReleaseDto } from './dto/create-press-release.dto'
import { UpdatePressReleaseDto } from './dto/update-press-release.dto'
import { QueryPressReleaseDto } from './dto/query-press-release.dto'
import { PressReleaseStatus, UserRole, Prisma } from '@prisma/client'
import type { MultipartFile } from '@fastify/multipart'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

@Injectable()
export class PressReleasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}
  // ─── Público: press releases em destaque ─────────────────────────
  async getFeatured() {
    const data = await this.prisma.pressRelease.findMany({
      where: { status: PressReleaseStatus.PUBLISHED },
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
    return data
  }
  // ─── Listagem ──────────────────────────────────────────────────
  async findAll(userId: string, userRole: string, query: QueryPressReleaseDto) {
    const { search, status, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.PressReleaseWhereInput = {}

    // Clientes só vêem os seus próprios press releases
    if (userRole !== UserRole.ADMIN) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      this.prisma.pressRelease.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          attachments: { orderBy: { createdAt: 'asc' } },
          _count: { select: { campaigns: true } },
        },
      }),
      this.prisma.pressRelease.count({ where }),
    ])

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  // ─── Detalhe ───────────────────────────────────────────────────
  async findOne(id: string, userId: string, userRole: string) {
    const pr = await this.prisma.pressRelease.findUnique({
      where: { id },
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
    })

    if (!pr) throw new NotFoundException('Press release não encontrado')
    if (pr.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão')
    }

    return pr
  }

  // ─── Criar ────────────────────────────────────────────────────
  async create(dto: CreatePressReleaseDto, userId: string) {
    const data: Prisma.PressReleaseCreateInput = {
      title: dto.title,
      content: dto.content,
      summary: dto.summary,
      status: dto.status ?? PressReleaseStatus.DRAFT,
      user: { connect: { id: userId } },
    }

    if (dto.scheduledAt) {
      data.scheduledAt = new Date(dto.scheduledAt)
      data.status = PressReleaseStatus.SCHEDULED
    }

    return this.prisma.pressRelease.create({
      data,
      include: { attachments: true },
    })
  }

  // ─── Actualizar ───────────────────────────────────────────────
  async update(id: string, dto: UpdatePressReleaseDto, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole)

    const data: Prisma.PressReleaseUpdateInput = {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    }

    if (dto.scheduledAt && dto.status === undefined) {
      data.status = PressReleaseStatus.SCHEDULED
    }

    return this.prisma.pressRelease.update({
      where: { id },
      data,
      include: { attachments: true },
    })
  }

  // ─── Publicar ─────────────────────────────────────────────────
  async publish(id: string, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole)

    return this.prisma.pressRelease.update({
      where: { id },
      data: {
        status: PressReleaseStatus.PUBLISHED,
        publishedAt: new Date(),
        scheduledAt: null,
      },
      include: { attachments: true },
    })
  }

  // ─── Arquivar ─────────────────────────────────────────────────
  async archive(id: string, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole)

    return this.prisma.pressRelease.update({
      where: { id },
      data: { status: PressReleaseStatus.ARCHIVED },
      include: { attachments: true },
    })
  }

  // ─── Duplicar ─────────────────────────────────────────────────
  async duplicate(id: string, userId: string, userRole: string) {
    const original = await this.findOne(id, userId, userRole)

    return this.prisma.pressRelease.create({
      data: {
        title: `Cópia — ${original.title}`,
        content: original.content,
        summary: original.summary,
        status: PressReleaseStatus.DRAFT,
        user: { connect: { id: userId } },
      },
      include: { attachments: true },
    })
  }

  // ─── Remover ──────────────────────────────────────────────────
  async remove(id: string, userId: string, userRole: string) {
    const pr = await this.findOne(id, userId, userRole)

    // Eliminar anexos do S3
    for (const att of pr.attachments) {
      const key = att.fileUrl.split('.amazonaws.com/')[1] ?? att.fileUrl
      await this.s3.delete(key)
    }

    await this.prisma.pressRelease.delete({ where: { id } })
  }

  // ─── Pré-visualização HTML ────────────────────────────────────
  async preview(id: string, userId: string, userRole: string): Promise<string> {
    const pr = await this.findOne(id, userId, userRole)

    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pr.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.75; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .summary { font-size: 1.1rem; color: #555; border-left: 4px solid #c00; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; }
    .meta { font-size: 0.85rem; color: #888; margin-bottom: 2rem; }
    .content { font-size: 1rem; }
    .content p { margin: 0 0 1rem; }
    .content h2 { font-size: 1.4rem; margin: 2rem 0 0.5rem; }
    .content h3 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; }
    .content ul, .content ol { padding-left: 1.5rem; margin: 0 0 1rem; }
    .content blockquote { border-left: 3px solid #ddd; padding-left: 1rem; color: #666; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.8rem; color: #aaa; }
  </style>
</head>
<body>
  <h1>${pr.title}</h1>
  ${pr.summary ? `<div class="summary">${pr.summary}</div>` : ''}
  <div class="meta">Publicado por AngoPress · ${new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  <div class="content">${pr.content}</div>
  <div class="footer">Comunicado distribuído via AngoPress — Plataforma Digital de Mailing de Imprensa</div>
</body>
</html>`
  }

  // ─── Upload de anexo ──────────────────────────────────────────
  async uploadAttachment(id: string, file: MultipartFile, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole)

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de ficheiro não permitido: ${file.mimetype}`)
    }

    const buffer = await file.toBuffer()
    const { url } = await this.s3.upload(buffer, file.filename, file.mimetype, 'press-releases')

    return this.prisma.pressReleaseAttachment.create({
      data: {
        pressReleaseId: id,
        fileName: file.filename,
        fileUrl: url,
        fileType: file.mimetype,
        fileSize: buffer.length,
      },
    })
  }

  // ─── Remover anexo ────────────────────────────────────────────
  async removeAttachment(id: string, attachmentId: string, userId: string, userRole: string) {
    await this.findOne(id, userId, userRole)

    const att = await this.prisma.pressReleaseAttachment.findUnique({
      where: { id: attachmentId },
    })

    if (!att || att.pressReleaseId !== id) {
      throw new NotFoundException('Anexo não encontrado')
    }

    const key = att.fileUrl.split('.amazonaws.com/')[1] ?? att.fileUrl
    await this.s3.delete(key)

    await this.prisma.pressReleaseAttachment.delete({ where: { id: attachmentId } })
  }
}
