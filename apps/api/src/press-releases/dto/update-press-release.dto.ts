import { PartialType } from '@nestjs/swagger'
import { CreatePressReleaseDto } from './create-press-release.dto'

export class UpdatePressReleaseDto extends PartialType(CreatePressReleaseDto) {}
