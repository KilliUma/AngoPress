import { IsEnum, IsOptional, IsString } from 'class-validator'
import { JournalistRegistrationStatus } from '@prisma/client'

export class ReviewRegistrationDto {
  @IsEnum(JournalistRegistrationStatus)
  status: JournalistRegistrationStatus

  @IsOptional()
  @IsString()
  notes?: string
}
