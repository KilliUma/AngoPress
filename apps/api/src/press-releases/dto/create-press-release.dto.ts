import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PressReleaseStatus } from '@prisma/client'

export class CreatePressReleaseDto {
  @ApiProperty({ example: 'AngoPress lança plataforma digital de imprensa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @ApiProperty({ example: '<p>Conteúdo em HTML do editor TipTap...</p>' })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiPropertyOptional({ example: 'Breve resumo do comunicado para jornalistas' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string

  @ApiPropertyOptional({ enum: PressReleaseStatus, default: PressReleaseStatus.DRAFT })
  @IsOptional()
  @IsEnum(PressReleaseStatus)
  status?: PressReleaseStatus

  @ApiPropertyOptional({
    example: '2026-05-01T10:00:00Z',
    description: 'Data de publicação agendada',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string
}
