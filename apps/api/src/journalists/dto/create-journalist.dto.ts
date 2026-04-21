import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MediaType } from '@prisma/client'

export class CreateJournalistDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'joao.silva@jornaldeangola.ao' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Jornal de Angola' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  outlet: string

  @ApiPropertyOptional({ example: 'Repórter de Economia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string

  @ApiProperty({ enum: MediaType, example: MediaType.PRINT })
  @IsEnum(MediaType)
  mediaType: MediaType

  @ApiPropertyOptional({ example: ['economia', 'política', 'negócios'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverageArea?: string[]

  @ApiPropertyOptional({ example: 'Luanda' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({ example: 'Luanda' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string

  @ApiPropertyOptional({ example: '+244923456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
