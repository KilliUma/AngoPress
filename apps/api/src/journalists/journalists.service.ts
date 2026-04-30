import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateJournalistDto } from './dto/create-journalist.dto'
import { UpdateJournalistDto } from './dto/update-journalist.dto'
import { QueryJournalistDto } from './dto/query-journalist.dto'
import { CreateJournalistRegistrationDto } from './dto/create-journalist-registration.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class JournalistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryJournalistDto) {
    const { search, mediaType, coverageArea, isActive, page = 1, limit = 20 } = query
    const skip = (page - 1) * limit

    const where: Prisma.JournalistWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { outlet: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (mediaType) {
      where.mediaType = mediaType
    }

    if (coverageArea) {
      where.coverageArea = { has: coverageArea }
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [data, total] = await Promise.all([
      this.prisma.journalist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.journalist.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const journalist = await this.prisma.journalist.findUnique({ where: { id } })
    if (!journalist) throw new NotFoundException('Jornalista não encontrado')
    return journalist
  }

  async create(dto: CreateJournalistDto) {
    const existing = await this.prisma.journalist.findUnique({
      where: { email: dto.email.toLowerCase() },
    })
    if (existing) throw new ConflictException('Este email já está registado')

    return this.prisma.journalist.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase(),
        coverageArea: dto.coverageArea ?? [],
        country: 'Angola',
      },
    })
  }

  async update(id: string, dto: UpdateJournalistDto) {
    await this.findOne(id) // garante que existe

    if (dto.email) {
      const existing = await this.prisma.journalist.findFirst({
        where: { email: dto.email.toLowerCase(), NOT: { id } },
      })
      if (existing) throw new ConflictException('Este email já está registado')
    }

    return this.prisma.journalist.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email ? dto.email.toLowerCase() : undefined,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.journalist.delete({ where: { id } })
  }

  /** Pedido de cadastro público por jornalistas */
  async submitRegistration(dto: CreateJournalistRegistrationDto) {
    const duplicate = await this.prisma.journalistRegistration.findFirst({
      where: { email: dto.email.toLowerCase(), status: 'PENDING' },
    })
    if (duplicate) {
      throw new ConflictException('Já existe um pedido pendente para este e-mail.')
    }
    return this.prisma.journalistRegistration.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        outlet: dto.outlet,
        mediaType: dto.mediaType,
        jobTitle: dto.jobTitle,
        city: dto.city,
        message: dto.message,
      },
    })
  }
}
