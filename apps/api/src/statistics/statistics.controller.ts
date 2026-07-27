import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { DashboardDto, DashboardQueryDto } from './dto/dashboard.dto'
import { StatisticsService } from './statistics.service'

@ApiTags('statistics')
@Controller('dashboard')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取首页统计' })
  @ApiQuery({ name: 'learnerId', required: true, type: String })
  @ApiOkResponse({ type: DashboardDto })
  @ApiNotFoundResponse({ description: '学习者不存在' })
  getDashboard(@Query() query: DashboardQueryDto): Promise<DashboardDto> {
    return this.statisticsService.getDashboard(query)
  }
}
