import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class DashboardQueryDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  learnerId!: string
}

export class DashboardWordBookProgressDto {
  @ApiProperty({ example: 'clxbook123' })
  id!: string

  @ApiProperty({ example: '基础英语' })
  name!: string

  @ApiProperty({ example: 100 })
  totalWordCount!: number

  @ApiProperty({ example: 42 })
  masteredWordCount!: number

  @ApiProperty({ example: 42 })
  completionPercent!: number
}

export class DashboardDto {
  @ApiProperty({ example: 8 })
  todayLearnedCount!: number

  @ApiProperty({ example: 10 })
  dailyGoal!: number

  @ApiProperty({ example: 4 })
  streakDays!: number

  @ApiProperty({ example: 42 })
  masteredWordCount!: number

  @ApiProperty({ example: 6 })
  reviewDueCount!: number

  @ApiProperty({ example: true })
  hasLearningHistory!: boolean

  @ApiPropertyOptional({ type: DashboardWordBookProgressDto, nullable: true })
  currentWordBook!: DashboardWordBookProgressDto | null
}
