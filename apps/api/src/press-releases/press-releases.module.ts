import { Module } from '@nestjs/common'
import { PressReleasesController } from './press-releases.controller'
import { PressReleasesService } from './press-releases.service'
import { UploadsModule } from '@/uploads/uploads.module'

@Module({
  imports: [UploadsModule],
  controllers: [PressReleasesController],
  providers: [PressReleasesService],
  exports: [PressReleasesService],
})
export class PressReleasesModule {}
