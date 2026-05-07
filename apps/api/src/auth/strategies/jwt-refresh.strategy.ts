import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/prisma/prisma.service'
import { Request } from 'express'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret') as string,
      passReqToCallback: true as const,
    })
  }

  async validate(req: Request, payload: { sub: string }) {
    const refreshToken = req.body?.refreshToken as string
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.sub,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    })
    if (!stored) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }
    return { id: payload.sub, refreshTokenId: stored.id }
  }
}
