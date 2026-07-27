import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '检查 API 是否正常运行' })
  @ApiResponse({ status: 200, description: 'API 正常运行' })
  getHealth() {
    return {
      status: 'ok',
      service: 'wordbox-api',
      timestamp: new Date().toISOString(),
    }
  }
}
