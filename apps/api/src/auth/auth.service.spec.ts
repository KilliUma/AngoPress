import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UsersService } from '@/users/users.service'
import { PrismaService } from '@/prisma/prisma.service'
import { UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

// ─── Prisma Mock ──────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
}

const mockUsersService = {
  findByEmail: jest.fn(),
  findByPasswordResetToken: jest.fn(),
  setPasswordResetToken: jest.fn(),
  updatePassword: jest.fn(),
}

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
  verify: jest.fn(),
}

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, unknown> = {
      'jwt.secret': 'test-secret',
      'jwt.accessTtl': '15m',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.refreshTtl': '7d',
    }
    return config[key]
  }),
}

// ─── Dados de teste ───────────────────────────────────────────────────────────

const baseUser = {
  id: 'user-1',
  name: 'Teste Utilizador',
  email: 'teste@angopress.ao',
  passwordHash: 'hashed',
  role: UserRole.CLIENT,
  status: UserStatus.ACTIVE,
  company: null,
  phone: null,
  avatarUrl: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
  })

  // ─── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    it('deve criar utilizador e retornar tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(baseUser)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' })
      mockJwtService.signAsync.mockResolvedValue('mock-token')

      const result = await service.register({
        name: 'Teste Utilizador',
        email: 'teste@angopress.ao',
        password: 'senha123',
        company: 'Empresa Teste',
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.user.email).toBe(baseUser.email)
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1)
    })

    it('deve lançar ConflictException para email duplicado', async () => {
      mockUsersService.findByEmail.mockResolvedValue(baseUser)

      await expect(
        service.register({
          name: 'Outro',
          email: 'teste@angopress.ao',
          password: 'senha123',
          company: 'Outra Empresa',
        }),
      ).rejects.toThrow(ConflictException)

      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })
  })

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('deve autenticar e retornar tokens com credenciais válidas', async () => {
      const hash = await bcrypt.hash('senha123', 12)
      const userWithHash = { ...baseUser, passwordHash: hash }

      mockUsersService.findByEmail.mockResolvedValue(userWithHash)
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' })

      const result = await service.login({ email: 'teste@angopress.ao', password: 'senha123' })

      expect(result).toHaveProperty('accessToken')
      expect(result.user.email).toBe(baseUser.email)
    })

    it('deve lançar UnauthorizedException para utilizador inexistente', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null)

      await expect(
        service.login({ email: 'naoexiste@test.ao', password: 'senha' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('deve lançar UnauthorizedException para senha errada', async () => {
      const hash = await bcrypt.hash('senha-correcta', 12)
      mockUsersService.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: hash })

      await expect(
        service.login({ email: 'teste@angopress.ao', password: 'senha-errada' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('deve lançar UnauthorizedException para conta inactiva', async () => {
      const hash = await bcrypt.hash('senha123', 12)
      mockUsersService.findByEmail.mockResolvedValue({
        ...baseUser,
        status: UserStatus.INACTIVE,
        passwordHash: hash,
      })

      await expect(
        service.login({ email: 'teste@angopress.ao', password: 'senha123' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('deve revogar todos os refresh tokens do utilizador', async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 2 })

      await service.logout('user-1')

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revoked: false },
        data: { revoked: true },
      })
    })
  })
})
