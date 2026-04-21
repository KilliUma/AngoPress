import { IsArray, ArrayNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class AddContactsDto {
  @ApiProperty({ example: ['cuid1', 'cuid2'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  journalistIds: string[]
}
