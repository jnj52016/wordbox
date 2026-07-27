import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import {
  CreateStudySessionDto,
  MarkProgressMasteredDto,
  SubmitProgressFeedbackDto,
  StudyAnswerResultDto,
  StudyQuestionDto,
  StudyResultDto,
  StudySessionDto,
  SubmitStudyAnswerDto,
  WordProgressDto,
} from './dto/study.dto'
import { StudyService } from './study.service'

@ApiTags('study-sessions')
@Controller('study-sessions')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建学习 Session' })
  @ApiOkResponse({ type: StudySessionDto })
  @ApiBadRequestResponse({ description: '学习参数不正确或单元没有单词' })
  @ApiNotFoundResponse({ description: '学习者或单元不存在' })
  createSession(@Body() dto: CreateStudySessionDto): Promise<StudySessionDto> {
    return this.studyService.createSession(dto)
  }

  @Get(':id/result')
  @ApiOperation({ summary: '获取学习结果' })
  @ApiOkResponse({ type: StudyResultDto })
  @ApiBadRequestResponse({ description: '学习 Session 尚未完成' })
  @ApiNotFoundResponse({ description: '学习 Session 不存在' })
  getResult(@Param('id') id: string): Promise<StudyResultDto> {
    return this.studyService.getResult(id)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取学习 Session' })
  @ApiOkResponse({ type: StudySessionDto })
  @ApiNotFoundResponse({ description: '学习 Session 不存在' })
  getSession(@Param('id') id: string): Promise<StudySessionDto> {
    return this.studyService.getSession(id)
  }

  @Get(':id/questions')
  @ApiOperation({ summary: '获取学习题目' })
  @ApiOkResponse({ type: [StudyQuestionDto] })
  @ApiNotFoundResponse({ description: '学习 Session 不存在' })
  getQuestions(@Param('id') id: string): Promise<StudyQuestionDto[]> {
    return this.studyService.getQuestions(id)
  }

  @Post(':id/answers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '提交学习答案' })
  @ApiOkResponse({ type: StudyAnswerResultDto })
  @ApiBadRequestResponse({ description: '题目或答案不正确' })
  @ApiConflictResponse({ description: '学习 Session 已完成' })
  @ApiNotFoundResponse({ description: '学习 Session 不存在' })
  submitAnswer(
    @Param('id') id: string,
    @Body() dto: SubmitStudyAnswerDto,
  ): Promise<StudyAnswerResultDto> {
    return this.studyService.submitAnswer(id, dto)
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '完成学习 Session' })
  @ApiOkResponse({ type: StudySessionDto })
  @ApiBadRequestResponse({ description: '尚未完成全部题目' })
  @ApiNotFoundResponse({ description: '学习 Session 不存在' })
  completeSession(@Param('id') id: string): Promise<StudySessionDto> {
    return this.studyService.completeSession(id)
  }
}

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly studyService: StudyService) {}

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '提交单词学习反馈' })
  @ApiOkResponse({ type: WordProgressDto })
  @ApiBadRequestResponse({ description: '反馈参数不正确' })
  @ApiNotFoundResponse({ description: '学习者或单词不存在' })
  submitFeedback(@Body() dto: SubmitProgressFeedbackDto): Promise<WordProgressDto> {
    return this.studyService.submitProgressFeedback(dto)
  }

  @Post('master')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手动标记单词为已掌握' })
  @ApiOkResponse({ type: WordProgressDto })
  @ApiBadRequestResponse({ description: '标记参数不正确' })
  @ApiNotFoundResponse({ description: '学习者或单词不存在' })
  markMastered(@Body() dto: MarkProgressMasteredDto): Promise<WordProgressDto> {
    return this.studyService.markProgressMastered(dto)
  }
}
