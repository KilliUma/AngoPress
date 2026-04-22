import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { Public } from '@/auth/decorators/public.decorator'
import type { FastifyRequest, FastifyReply } from 'fastify'

@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  /** Pixel de rastreio de abertura — público */
  @Public()
  @Get('track/open/:token')
  async trackOpen(
    @Param('token') token: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const ip = req.ip
    const userAgent = req.headers['user-agent']
    const gif = await this.analytics.trackOpen(token, ip, userAgent)
    reply
      .header('Content-Type', 'image/gif')
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .send(gif)
  }

  /** Redirect com rastreio de clique — público */
  @Public()
  @Get('track/click/:token')
  async trackClick(
    @Param('token') token: string,
    @Query('url') url: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    if (!url) return reply.status(400).send({ message: 'url é obrigatório' })
    const ip = req.ip
    const userAgent = req.headers['user-agent']
    await this.analytics.trackClick(token, url, ip, userAgent)
    reply.redirect(url, 302)
  }

  /** Métricas agregadas de uma campanha */
  @Get('analytics/campaigns/:id')
  getCampaignMetrics(@Param('id') id: string, @CurrentUser() _user: { id: string }) {
    return this.analytics.getCampaignMetrics(id)
  }

  /** Eventos individuais paginados */
  @Get('analytics/campaigns/:id/events')
  getCampaignEvents(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.analytics.getCampaignEvents(id, Number(page) || 1, Number(limit) || 50)
  }
}
