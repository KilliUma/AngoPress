import { Controller, Post, Param, HttpCode, HttpStatus, Body } from '@nestjs/common'
import { DispatchService } from './dispatch.service'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { IsISO8601, IsNotEmpty } from 'class-validator'

class ScheduleDto {
  @IsNotEmpty()
  @IsISO8601()
  scheduledAt: string
}

@Controller('campaigns')
export class DispatchController {
  constructor(private readonly dispatch: DispatchService) {}

  @Post(':id/send')
  @HttpCode(HttpStatus.ACCEPTED)
  send(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.dispatch.enqueueCampaign(id, user.id)
  }

  @Post(':id/schedule')
  @HttpCode(HttpStatus.ACCEPTED)
  schedule(
    @Param('id') id: string,
    @Body() body: ScheduleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.dispatch.scheduleCampaign(id, user.id, new Date(body.scheduledAt))
  }
}
