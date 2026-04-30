import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/prisma/prisma.service'
import { UsersService } from '@/users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('Este email já está em uso')
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        company: dto.company,
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
      },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    this.logger.log(`Novo utilizador registado: ${user.email}`)

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase())
    if (!user) {
      // Verificar se é um jornalista com pedido de cadastro pendente ou rejeitado
      const journalistReg = await this.prisma.journalistRegistration.findFirst({
        where: { email: dto.email.toLowerCase() },
        orderBy: { createdAt: 'desc' },
      })
      if (journalistReg?.status === 'PENDING') {
        throw new UnauthorizedException(
          'O seu pedido de cadastro como jornalista está em análise. Receberá uma notificação quando for aprovado.',
        )
      }
      if (journalistReg?.status === 'REJECTED') {
        throw new UnauthorizedException(
          'O seu pedido de cadastro como jornalista foi rejeitado. Contacte o suporte para mais informações.',
        )
      }
      throw new UnauthorizedException('Credenciais inválidas')
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Conta inactiva. Contacte o suporte.')
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('A sua conta está pendente de activação. Contacte o suporte.')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async refresh(_userId: string, refreshTokenId: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: refreshTokenId },
      include: { user: true },
    })

    if (!storedToken || storedToken.revoked) {
      throw new UnauthorizedException('Refresh token inválido')
    }

    // Rotação do refresh token — revogar o antigo
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revoked: true },
    })

    const { user } = storedToken
    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.saveRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revoked: false },
      data: { revoked: true },
    })
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase())
    // Não revelar se o email existe — sempre retornar sucesso
    if (!user) return

    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 horas

    await this.usersService.setPasswordResetToken(user.id, token, expires)

    // TODO: Enviar email via SES (Fase 3)
    this.logger.log(`Token de reset gerado para: ${user.email} — token: ${token}`)
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(dto.token)
    if (!user) {
      throw new BadRequestException('Token inválido ou expirado')
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    await this.usersService.updatePassword(user.id, passwordHash)

    // Revogar todos os refresh tokens activos
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    })
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new NotFoundException('Utilizador não encontrado')
    return this.sanitizeUser(user)
  }

  // ──────────────────────────────────────────
  // Helpers privados
  // ──────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    const secret = this.configService.get<string>('jwt.secret') as string
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') as string
    const accessExpiresIn = (this.configService.get<string>('jwt.accessExpiresIn') ??
      '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`
    const refreshExpiresIn = (this.configService.get<string>('jwt.refreshExpiresIn') ??
      '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret, expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
    ])

    return { accessToken, refreshToken }
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d'
    const days = parseInt(refreshExpiresIn.replace('d', ''), 10) || 7
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    await this.prisma.refreshToken.create({ data: { token, userId, expiresAt } })
  }

  private sanitizeUser(user: {
    id: string
    name: string
    email: string
    role: string
    status: string
    company: string | null
    phone: string | null
    avatarUrl: string | null
    createdAt: Date
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      company: user.company,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    }
  }
}
