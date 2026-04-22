import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CampaignsService } from './campaigns.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { QueryCampaignDto } from './dto/query-campaign.dto'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string; role: UserRole }, @Query() query: QueryCampaignDto) {
    return this.campaigns.findAll(user.id, user.role, query)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.campaigns.findOne(id, user.id, user.role)
  }

  @Get(':id/report')
  getReport(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.campaigns.getReport(id, user.id, user.role)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.campaigns.create(dto, user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; role: UserRole }) {
    return this.campaigns.remove(id, user.id, user.role)
  }
}
