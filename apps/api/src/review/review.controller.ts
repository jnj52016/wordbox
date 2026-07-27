import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { ReviewQueueDto, ReviewQueueQueryDto } from './dto/review.dto'
import { ReviewService } from './review.service'

@ApiTags('review')
@Controller('review-queue')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({ summary: '获取待复习单词' })
  @ApiQuery({ name: 'learnerId', required: true, type: String })
  @ApiOkResponse({ type: ReviewQueueDto })
  @ApiNotFoundResponse({ description: '学习者不存在' })
  getQueue(@Query() query: ReviewQueueQueryDto): Promise<ReviewQueueDto> {
    return this.reviewService.findQueue(query)
  }
}
