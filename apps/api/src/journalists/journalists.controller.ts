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
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JournalistsService } from './journalists.service'
import { CreateJournalistDto } from './dto/create-journalist.dto'
import { UpdateJournalistDto } from './dto/update-journalist.dto'
import { QueryJournalistDto } from './dto/query-journalist.dto'
import { Roles } from '@/auth/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('journalists')
@ApiBearerAuth()
@Controller('journalists')
export class JournalistsController {
  constructor(private readonly journalistsService: JournalistsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar jornalistas com filtros e paginação' })
  findAll(@Query() query: QueryJournalistDto) {
    return this.journalistsService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter jornalista por ID' })
  findOne(@Param('id') id: string) {
    return this.journalistsService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo jornalista' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateJournalistDto) {
    return this.journalistsService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar jornalista' })
  update(@Param('id') id: string, @Body() dto: UpdateJournalistDto) {
    return this.journalistsService.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover jornalista (apenas ADMIN)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.journalistsService.remove(id)
  }
}
