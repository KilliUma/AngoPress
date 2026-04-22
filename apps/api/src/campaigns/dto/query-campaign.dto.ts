import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { CampaignStatus } from '@prisma/client'

export class QueryCampaignDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
