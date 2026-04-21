import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token, passwordResetExpires: { gt: new Date() } },
    })
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword, passwordResetToken: null, passwordResetExpires: null },
    })
  }

  async setPasswordResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })
  }
}
