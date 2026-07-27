import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { WordStatus } from '@prisma/client'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ReviewQueueQueryDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  learnerId!: string
}

export class ReviewWordDto {
  @ApiProperty({ example: 'clxword123' })
  id!: string

  @ApiProperty({ example: 'hello' })
  spelling!: string

  @ApiPropertyOptional({ nullable: true, example: '/həˈloʊ/' })
  phonetic!: string | null

  @ApiProperty({ example: '你好；喂' })
  meaning!: string

  @ApiPropertyOptional({ nullable: true, example: 'interjection' })
  partOfSpeech!: string | null

  @ApiPropertyOptional({ nullable: true, example: 'Hello, everyone.' })
  example!: string | null

  @ApiPropertyOptional({ nullable: true, example: '大家好。' })
  exampleZh!: string | null

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null

  @ApiPropertyOptional({ nullable: true, example: '👋' })
  emoji!: string | null

  @ApiProperty({ enum: WordStatus })
  status!: WordStatus

  @ApiProperty({ example: 2 })
  correctCount!: number

  @ApiProperty({ example: 1 })
  wrongCount!: number

  @ApiPropertyOptional({ nullable: true, format: 'date-time' })
  lastSeenAt!: Date | null

  @ApiProperty({ format: 'date-time' })
  nextReviewAt!: Date
}

export class ReviewQueueDto {
  @ApiProperty({ example: 3 })
  total!: number

  @ApiProperty({ type: [ReviewWordDto] })
  words!: ReviewWordDto[]
}
