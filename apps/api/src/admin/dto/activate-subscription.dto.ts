import { IsString, IsOptional, IsISO8601 } from 'class-validator'

export class AdminActivateSubscriptionDto {
  @IsOptional()
  @IsString()
  planId?: string

  @IsOptional()
  @IsISO8601()
  expiresAt?: string

  @IsOptional()
  @IsString()
  adminNotes?: string
}
