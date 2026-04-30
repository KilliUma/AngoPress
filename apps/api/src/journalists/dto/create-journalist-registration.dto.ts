import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MediaType } from '@prisma/client'

export class CreateJournalistRegistrationDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiProperty({ example: 'joao@jornalangola.ao' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Jornal de Angola' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  outlet: string

  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  mediaType: MediaType

  @ApiPropertyOptional({ example: 'Repórter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string

  @ApiPropertyOptional({ example: 'Luanda' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @ApiPropertyOptional({ example: 'Cubro economia e tecnologia há 5 anos.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string
}
