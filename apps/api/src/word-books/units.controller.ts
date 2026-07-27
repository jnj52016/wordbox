import { Controller, Get, Param } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UnitDetailDto, UnitWordsResponseDto } from './dto/word-book.dto'
import { WordBooksService } from './word-books.service'

@ApiTags('units')
@Controller('units')
export class UnitsController {
  constructor(private readonly wordBooksService: WordBooksService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取单元详情和下一单元' })
  @ApiOkResponse({ type: UnitDetailDto })
  @ApiNotFoundResponse({ description: '单元不存在' })
  findOne(@Param('id') id: string): Promise<UnitDetailDto> {
    return this.wordBooksService.findUnit(id)
  }

  @Get(':id/words')
  @ApiOperation({ summary: '获取单元单词列表' })
  @ApiOkResponse({ type: UnitWordsResponseDto })
  @ApiNotFoundResponse({ description: '单元不存在' })
  findWords(@Param('id') id: string): Promise<UnitWordsResponseDto> {
    return this.wordBooksService.findUnitWords(id)
  }
}
