import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxSendsMonth: number

  @IsArray()
  @IsString({ each: true })
  features: string[]

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMonthlyAoa: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceYearlyAoa?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number
}
