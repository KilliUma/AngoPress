import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MailingListsService } from './mailing-lists.service'
import { CreateMailingListDto } from './dto/create-mailing-list.dto'
import { UpdateMailingListDto } from './dto/update-mailing-list.dto'
import { AddContactsDto } from './dto/add-contacts.dto'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'

interface JwtUser {
  id: string
  email: string
  role: string
  name: string
}

@ApiTags('mailing-lists')
@ApiBearerAuth()
@Controller('mailing-lists')
export class MailingListsController {
  constructor(private readonly mailingListsService: MailingListsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar as minhas listas de mailing' })
  findAll(@CurrentUser() user: JwtUser) {
    return this.mailingListsService.findAll(user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter lista com contactos' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.mailingListsService.findOne(id, user.id, user.role)
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova lista de mailing' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMailingListDto, @CurrentUser() user: JwtUser) {
    return this.mailingListsService.create(dto, user.id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar lista' })
  update(@Param('id') id: string, @Body() dto: UpdateMailingListDto, @CurrentUser() user: JwtUser) {
    return this.mailingListsService.update(id, dto, user.id, user.role)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lista' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.mailingListsService.remove(id, user.id, user.role)
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Adicionar jornalistas à lista' })
  addContacts(@Param('id') id: string, @Body() dto: AddContactsDto, @CurrentUser() user: JwtUser) {
    return this.mailingListsService.addContacts(id, dto, user.id, user.role)
  }

  @Delete(':id/contacts/:journalistId')
  @ApiOperation({ summary: 'Remover jornalista da lista' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContact(
    @Param('id') id: string,
    @Param('journalistId') journalistId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.mailingListsService.removeContact(id, journalistId, user.id, user.role)
  }
}
