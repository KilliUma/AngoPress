import { IsString, IsNotEmpty } from 'class-validator'

export class RequestSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string
}
