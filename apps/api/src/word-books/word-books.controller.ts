import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import {
  UnitSummaryDto,
  WordBookDetailDto,
  WordBookListItemDto,
} from './dto/word-book.dto'
import { WordBooksService } from './word-books.service'

@ApiTags('word-books')
@Controller('word-books')
export class WordBooksController {
  constructor(private readonly wordBooksService: WordBooksService) {}

  @Get()
  @ApiOperation({ summary: '获取词书列表' })
  @ApiOkResponse({ type: [WordBookListItemDto] })
  findAll(): Promise<WordBookListItemDto[]> {
    return this.wordBooksService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取词书详情' })
  @ApiOkResponse({ type: WordBookDetailDto })
  @ApiNotFoundResponse({ description: '词书不存在' })
  findOne(@Param('id') id: string): Promise<WordBookDetailDto> {
    return this.wordBooksService.findOne(id)
  }

  @Get(':id/units')
  @ApiOperation({ summary: '获取词书单元列表' })
  @ApiOkResponse({ type: [UnitSummaryDto] })
  @ApiNotFoundResponse({ description: '词书不存在' })
  findUnits(@Param('id') id: string): Promise<UnitSummaryDto[]> {
    return this.wordBooksService.findUnits(id)
  }
}
