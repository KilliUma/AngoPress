import { Module } from '@nestjs/common'
import { DispatchController } from './dispatch.controller'
import { DispatchService } from './dispatch.service'
import { EmailService } from './email.service'

@Module({
  controllers: [DispatchController],
  providers: [DispatchService, EmailService],
  exports: [DispatchService, EmailService],
})
export class DispatchModule {}
