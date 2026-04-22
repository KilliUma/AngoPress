import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray, IsISO8601 } from 'class-validator'

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  pressReleaseId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string

  /** IDs de jornalistas a incluir diretamente */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  journalistIds?: string[]

  /** IDs de listas de envio a incluir */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mailingListIds?: string[]

  /** Data/hora para envio agendado (ISO 8601) */
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string
}
