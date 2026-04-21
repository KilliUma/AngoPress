import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
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
