import { ApiProperty } from '@nestjs/swagger'

export class LearnerDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  publicId!: string

  @ApiProperty({ example: 10 })
  dailyGoal!: number

  @ApiProperty({ example: true })
  autoPronounce!: boolean

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}

export class ResetProgressResponseDto {
  @ApiProperty({ example: 12 })
  deletedProgressCount!: number

  @ApiProperty({ example: 3 })
  deletedSessionCount!: number
}
