import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UnitSummaryDto {
  @ApiProperty({ example: 'clxunit123' })
  id!: string

  @ApiProperty({ example: '日常基础' })
  name!: string

  @ApiProperty({ example: 1 })
  order!: number

  @ApiProperty({ example: 20 })
  wordCount!: number
}

export class UnitDetailDto extends UnitSummaryDto {
  @ApiProperty({ example: 'clxbook123' })
  wordBookId!: string

  @ApiPropertyOptional({ nullable: true, example: 'clxunit456' })
  nextUnitId!: string | null
}

export class WordBookListItemDto {
  @ApiProperty({ example: 'clxbook123' })
  id!: string

  @ApiProperty({ example: 'starter' })
  slug!: string

  @ApiProperty({ example: 'WordBox 入门词书' })
  name!: string

  @ApiPropertyOptional({ nullable: true, example: '适合初学者的日常英语基础词汇。' })
  description!: string | null

  @ApiPropertyOptional({ nullable: true, example: 'BEGINNER' })
  level!: string | null

  @ApiPropertyOptional({ nullable: true, example: '#2563eb' })
  coverColor!: string | null

  @ApiProperty({ example: 5 })
  unitCount!: number

  @ApiProperty({ example: 100 })
  wordCount!: number
}

export class WordBookDetailDto extends WordBookListItemDto {
  @ApiProperty({ type: [UnitSummaryDto] })
  units!: UnitSummaryDto[]
}

export class WordDto {
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

  @ApiPropertyOptional({ nullable: true, example: 'Hello, how are you?' })
  example!: string | null

  @ApiPropertyOptional({ nullable: true, example: '你好，你怎么样？' })
  exampleZh!: string | null

  @ApiPropertyOptional({ nullable: true, example: null })
  imageUrl!: string | null

  @ApiPropertyOptional({ nullable: true, example: '👋' })
  emoji!: string | null

  @ApiProperty({ example: 1 })
  order!: number
}

export class UnitWordsResponseDto {
  @ApiProperty({ type: UnitSummaryDto })
  unit!: UnitSummaryDto

  @ApiProperty({ type: [WordDto] })
  words!: WordDto[]

  @ApiProperty({ example: 20 })
  total!: number
}
