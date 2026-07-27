import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { StudyMode, QuestionType, WordStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateStudySessionDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  learnerId!: string

  @ApiProperty({ example: 'clxunit123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  unitId!: string

  @ApiPropertyOptional({ enum: StudyMode, default: StudyMode.LEARN })
  @IsOptional()
  @IsEnum(StudyMode)
  mode?: StudyMode

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 20, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number
}

export class SubmitStudyAnswerDto {
  @ApiProperty({ example: 'cuid-session:cuid-word' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  questionId!: string

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  questionType!: QuestionType

  @ApiProperty({ example: '你好；喂' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  answer!: string
}

export enum ProgressFeedback {
  UNKNOWN = 'UNKNOWN',
  FAMILIAR = 'FAMILIAR',
  KNOWN = 'KNOWN',
}

export class SubmitProgressFeedbackDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  learnerId!: string

  @ApiProperty({ example: 'clxword123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  wordId!: string

  @ApiProperty({ enum: ProgressFeedback })
  @IsEnum(ProgressFeedback)
  feedback!: ProgressFeedback
}

export class StudySessionDto {
  @ApiProperty({ example: 'clxsession123' })
  id!: string

  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  learnerId!: string

  @ApiProperty({ example: 'clxunit123' })
  unitId!: string

  @ApiProperty({ enum: StudyMode })
  mode!: StudyMode

  @ApiProperty({ example: 10 })
  totalCount!: number

  @ApiProperty({ example: 3 })
  answeredCount!: number

  @ApiProperty({ example: 2 })
  correctCount!: number

  @ApiProperty({ format: 'date-time' })
  startedAt!: Date

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  completedAt!: Date | null
}

export class StudyQuestionDto {
  @ApiProperty({ example: 'clxsession123:clxword123' })
  questionId!: string

  @ApiProperty({ example: 'clxword123' })
  wordId!: string

  @ApiProperty({ enum: QuestionType })
  questionType!: QuestionType

  @ApiProperty({ example: 'hello' })
  prompt!: string

  @ApiPropertyOptional({ nullable: true, example: '/həˈloʊ/' })
  phonetic!: string | null

  @ApiPropertyOptional({ nullable: true, example: '👋' })
  emoji!: string | null

  @ApiPropertyOptional({ nullable: true, example: 'hello' })
  spelling?: string

  @ApiProperty({ type: [String], example: ['你好；喂', '谢谢', '再见'] })
  options!: string[]
}

export class WordProgressDto {
  @ApiProperty({ enum: WordStatus })
  status!: WordStatus

  @ApiProperty({ example: 2 })
  correctStreak!: number

  @ApiProperty({ example: 3 })
  correctCount!: number

  @ApiProperty({ example: 1 })
  wrongCount!: number

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  nextReviewAt!: Date | null
}

export class StudyAnswerResultDto {
  @ApiProperty({ example: 'clxsession123:clxword123' })
  questionId!: string

  @ApiProperty({ enum: QuestionType })
  questionType!: QuestionType

  @ApiProperty({ example: true })
  isCorrect!: boolean

  @ApiProperty({ example: '你好；喂' })
  correctAnswer!: string

  @ApiProperty({ example: false })
  duplicate!: boolean

  @ApiProperty({ type: WordProgressDto })
  progress!: WordProgressDto
}

export class StudyResultAnswerDto {
  @ApiProperty({ example: 'clxword123' })
  wordId!: string

  @ApiProperty({ example: 'hello' })
  spelling!: string

  @ApiProperty({ example: '你好；喂' })
  meaning!: string

  @ApiPropertyOptional({ nullable: true, example: '/həˈloʊ/' })
  phonetic!: string | null

  @ApiPropertyOptional({ nullable: true, example: '👋' })
  emoji!: string | null

  @ApiProperty({ enum: QuestionType })
  questionType!: QuestionType

  @ApiPropertyOptional({ nullable: true, example: '哈喽' })
  submittedAnswer!: string | null

  @ApiProperty({ example: true })
  isCorrect!: boolean

  @ApiProperty({ example: '你好；喂' })
  correctAnswer!: string

  @ApiProperty({ type: WordProgressDto, nullable: true })
  progress!: WordProgressDto | null
}

export class StudyResultDto {
  @ApiProperty({ type: StudySessionDto })
  session!: StudySessionDto

  @ApiProperty({ example: 3 })
  wrongCount!: number

  @ApiProperty({ example: 70 })
  accuracy!: number

  @ApiProperty({ type: [StudyResultAnswerDto] })
  answers!: StudyResultAnswerDto[]
}
