import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export class CreateLearnerDto {
  @ApiProperty({ example: '8b6b9f4d-2f9d-4b50-9c6c-3c0a3d7c7b2a' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'publicId 只能包含字母、数字、下划线和连字符',
  })
  publicId!: string
}
