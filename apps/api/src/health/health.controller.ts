import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../auth/decorators/public.decorator'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Verificar status da API' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AngoPress API',
      version: '1.0.0',
    }
  }
}
