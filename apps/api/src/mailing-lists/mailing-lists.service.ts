import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateMailingListDto } from './dto/create-mailing-list.dto'
import { UpdateMailingListDto } from './dto/update-mailing-list.dto'
import { AddContactsDto } from './dto/add-contacts.dto'
import { UserRole } from '@prisma/client'

@Injectable()
export class MailingListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.mailingList.findMany({
      where: { userId },
      include: {
        _count: { select: { contacts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, userId: string, userRole: string) {
    const list = await this.prisma.mailingList.findUnique({
      where: { id },
      include: {
        contacts: {
          include: { journalist: true },
          orderBy: { addedAt: 'desc' },
        },
        _count: { select: { contacts: true } },
      },
    })

    if (!list) throw new NotFoundException('Lista não encontrada')
    if (list.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para aceder a esta lista')
    }

    return list
  }

  async create(dto: CreateMailingListDto, userId: string) {
    return this.prisma.mailingList.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
      },
      include: { _count: { select: { contacts: true } } },
    })
  }

  async update(id: string, dto: UpdateMailingListDto, userId: string, userRole: string) {
    const list = await this.prisma.mailingList.findUnique({ where: { id } })
    if (!list) throw new NotFoundException('Lista não encontrada')
    if (list.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para editar esta lista')
    }

    return this.prisma.mailingList.update({
      where: { id },
      data: dto,
      include: { _count: { select: { contacts: true } } },
    })
  }

  async remove(id: string, userId: string, userRole: string) {
    const list = await this.prisma.mailingList.findUnique({ where: { id } })
    if (!list) throw new NotFoundException('Lista não encontrada')
    if (list.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para remover esta lista')
    }

    await this.prisma.mailingList.delete({ where: { id } })
  }

  async addContacts(id: string, dto: AddContactsDto, userId: string, userRole: string) {
    const list = await this.prisma.mailingList.findUnique({ where: { id } })
    if (!list) throw new NotFoundException('Lista não encontrada')
    if (list.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para editar esta lista')
    }

    // Inserir ignorando duplicados via skipDuplicates
    await this.prisma.mailingListContact.createMany({
      data: dto.journalistIds.map((journalistId) => ({ listId: id, journalistId })),
      skipDuplicates: true,
    })

    return this.findOne(id, userId, userRole)
  }

  async removeContact(id: string, journalistId: string, userId: string, userRole: string) {
    const list = await this.prisma.mailingList.findUnique({ where: { id } })
    if (!list) throw new NotFoundException('Lista não encontrada')
    if (list.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão para editar esta lista')
    }

    await this.prisma.mailingListContact.deleteMany({
      where: { listId: id, journalistId },
    })
  }
}
