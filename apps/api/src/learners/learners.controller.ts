import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { CreateLearnerDto } from './dto/create-learner.dto'
import { LearnerDto, ResetProgressResponseDto } from './dto/learner.dto'
import { UpdateLearnerSettingsDto } from './dto/update-learner-settings.dto'
import { LearnersService } from './learners.service'

@ApiTags('learners')
@Controller('learners')
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建或恢复匿名学习者' })
  @ApiOkResponse({ type: LearnerDto })
  @ApiBadRequestResponse({ description: 'publicId 格式不正确' })
  createOrGet(@Body() dto: CreateLearnerDto): Promise<LearnerDto> {
    return this.learnersService.createOrGet(dto)
  }

  @Get(':publicId')
  @ApiOperation({ summary: '获取匿名学习者信息' })
  @ApiOkResponse({ type: LearnerDto })
  @ApiNotFoundResponse({ description: '学习者不存在' })
  findByPublicId(@Param('publicId') publicId: string): Promise<LearnerDto> {
    return this.learnersService.findByPublicId(publicId)
  }

  @Patch(':publicId/settings')
  @ApiOperation({ summary: '修改学习者设置' })
  @ApiOkResponse({ type: LearnerDto })
  @ApiBadRequestResponse({ description: '设置参数不正确' })
  @ApiNotFoundResponse({ description: '学习者不存在' })
  updateSettings(
    @Param('publicId') publicId: string,
    @Body() dto: UpdateLearnerSettingsDto,
  ): Promise<LearnerDto> {
    return this.learnersService.updateSettings(publicId, dto)
  }

  @Delete(':publicId/progress')
  @ApiOperation({ summary: '重置学习进度' })
  @ApiOkResponse({ type: ResetProgressResponseDto })
  @ApiNotFoundResponse({ description: '学习者不存在' })
  resetProgress(@Param('publicId') publicId: string): Promise<ResetProgressResponseDto> {
    return this.learnersService.resetProgress(publicId)
  }
}
