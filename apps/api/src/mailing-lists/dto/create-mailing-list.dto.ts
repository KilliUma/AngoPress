import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMailingListDto {
  @ApiProperty({ example: 'Media Luanda — Economia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'Principais meios do sector económico de Luanda' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}
