import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { PressReleasesService } from './press-releases.service'
import { CreatePressReleaseDto } from './dto/create-press-release.dto'
import { UpdatePressReleaseDto } from './dto/update-press-release.dto'
import { QueryPressReleaseDto } from './dto/query-press-release.dto'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'

interface JwtUser {
  id: string
  email: string
  role: string
  name: string
}

import { Public } from '@/auth/decorators/public.decorator'

@ApiTags('press-releases')
@ApiBearerAuth()
@Controller('press-releases')
export class PressReleasesController {
  constructor(private readonly pressReleasesService: PressReleasesService) {}

  @Public()
  @Get('public/featured')
  @ApiOperation({ summary: 'Press releases publicados em destaque (público)' })
  getFeatured() {
    return this.pressReleasesService.getFeatured()
  }

  @Get()
  @ApiOperation({ summary: 'Listar press releases com filtros' })
  findAll(@Query() query: QueryPressReleaseDto, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.findAll(user.id, user.role, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter press release por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.findOne(id, user.id, user.role)
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Pré-visualização HTML do press release' })
  async preview(@Param('id') id: string, @CurrentUser() user: JwtUser, @Res() reply: FastifyReply) {
    const html = await this.pressReleasesService.preview(id, user.id, user.role)
    reply.header('Content-Type', 'text/html; charset=utf-8').send(html)
  }

  @Post()
  @ApiOperation({ summary: 'Criar press release' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePressReleaseDto, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.create(dto, user.id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar press release' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePressReleaseDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pressReleasesService.update(id, dto, user.id, user.role)
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publicar press release' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.publish(id, user.id, user.role)
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Arquivar press release' })
  archive(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.archive(id, user.id, user.role)
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar press release como rascunho' })
  @HttpCode(HttpStatus.CREATED)
  duplicate(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.duplicate(id, user.id, user.role)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover press release e seus anexos' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.pressReleasesService.remove(id, user.id, user.role)
  }

  // ─── Anexos ───────────────────────────────────────────────────

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Fazer upload de anexo para o press release' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  async uploadAttachment(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file()
    if (!file) {
      return { error: 'Nenhum ficheiro enviado' }
    }
    return this.pressReleasesService.uploadAttachment(id, file, user.id, user.role)
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Remover anexo do press release' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.pressReleasesService.removeAttachment(id, attachmentId, user.id, user.role)
  }
}
