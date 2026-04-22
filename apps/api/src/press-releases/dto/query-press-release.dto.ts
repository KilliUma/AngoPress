import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PressReleaseStatus } from '@prisma/client'
import { Type } from 'class-transformer'

export class QueryPressReleaseDto {
  @ApiPropertyOptional({ example: 'AngoPress', description: 'Pesquisa por título' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: PressReleaseStatus })
  @IsOptional()
  @IsEnum(PressReleaseStatus)
  status?: PressReleaseStatus

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
