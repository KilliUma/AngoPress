import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MediaType } from '@prisma/client'
import { Type } from 'class-transformer'

export class QueryJournalistDto {
  @ApiPropertyOptional({ example: 'João', description: 'Pesquisa por nome, email ou veículo' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType

  @ApiPropertyOptional({ example: 'economia', description: 'Filtrar por área de cobertura' })
  @IsOptional()
  @IsString()
  coverageArea?: string

  @ApiPropertyOptional({ example: true, description: 'Mostrar apenas activos/inactivos' })
  @IsOptional()
  isActive?: string // recebido como string via query string

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
