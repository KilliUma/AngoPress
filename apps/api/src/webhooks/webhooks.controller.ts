import { Controller, Post, Get, Param, Res, HttpCode, HttpStatus, Body } from '@nestjs/common'
import { WebhooksService } from './webhooks.service'
import { Public } from '@/auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@Controller()
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  /** Endpoint SNS para notificações SES — sem autenticação */
  @Public()
  @Post('webhooks/ses')
  @HttpCode(HttpStatus.OK)
  async handleSes(@Body() body: unknown) {
    await this.webhooks.handleSesNotification(body)
    return { ok: true }
  }

  /** Opt-out via link único no e-mail */
  @Public()
  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string, @Res() reply: FastifyReply) {
    const html = await this.webhooks.handleUnsubscribe(token)
    reply.header('Content-Type', 'text/html; charset=utf-8').send(html)
  }
}
