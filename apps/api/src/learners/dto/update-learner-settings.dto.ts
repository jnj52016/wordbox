import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator'

export class UpdateLearnerSettingsDto {
  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  dailyGoal?: number

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoPronounce?: boolean
}
