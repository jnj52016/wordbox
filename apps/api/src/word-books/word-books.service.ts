import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  UnitSummaryDto,
  UnitDetailDto,
  UnitWordsResponseDto,
  WordBookDetailDto,
  WordBookListItemDto,
  WordDto,
} from './dto/word-book.dto'

const wordBookFields = {
  id: true,
  slug: true,
  name: true,
  description: true,
  level: true,
  coverColor: true,
} as const

const unitFields = {
  id: true,
  name: true,
  order: true,
} as const

const wordFields = {
  id: true,
  spelling: true,
  phonetic: true,
  meaning: true,
  partOfSpeech: true,
  example: true,
  exampleZh: true,
  imageUrl: true,
  emoji: true,
  order: true,
} as const

type UnitWithCount = {
  id: string
  name: string
  order: number
  _count: { words: number }
}

function toUnitSummary(unit: UnitWithCount): UnitSummaryDto {
  return {
    id: unit.id,
    name: unit.name,
    order: unit.order,
    wordCount: unit._count.words,
  }
}

function toWordBookListItem(wordBook: {
  id: string
  slug: string
  name: string
  description: string | null
  level: string | null
  coverColor: string | null
  units: Array<{ _count: { words: number } }>
}): WordBookListItemDto {
  return {
    id: wordBook.id,
    slug: wordBook.slug,
    name: wordBook.name,
    description: wordBook.description,
    level: wordBook.level,
    coverColor: wordBook.coverColor,
    unitCount: wordBook.units.length,
    wordCount: wordBook.units.reduce((total, unit) => total + unit._count.words, 0),
  }
}

function toWord(word: {
  id: string
  spelling: string
  phonetic: string | null
  meaning: string
  partOfSpeech: string | null
  example: string | null
  exampleZh: string | null
  imageUrl: string | null
  emoji: string | null
  order: number
}): WordDto {
  return { ...word }
}

@Injectable()
export class WordBooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<WordBookListItemDto[]> {
    const wordBooks = await this.prisma.wordBook.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        ...wordBookFields,
        units: {
          select: { _count: { select: { words: true } } },
        },
      },
    })

    return wordBooks.map(toWordBookListItem)
  }

  async findOne(id: string): Promise<WordBookDetailDto> {
    const wordBook = await this.prisma.wordBook.findUnique({
      where: { id },
      select: {
        ...wordBookFields,
        units: {
          orderBy: { order: 'asc' },
          select: {
            ...unitFields,
            _count: { select: { words: true } },
          },
        },
      },
    })

    if (!wordBook) {
      throw new NotFoundException('词书不存在')
    }

    const units = wordBook.units.map(toUnitSummary)
    return {
      ...toWordBookListItem({ ...wordBook, units: wordBook.units }),
      units,
    }
  }

  async findUnits(wordBookId: string): Promise<UnitSummaryDto[]> {
    const wordBook = await this.prisma.wordBook.findUnique({
      where: { id: wordBookId },
      select: {
        id: true,
        units: {
          orderBy: { order: 'asc' },
          select: {
            ...unitFields,
            _count: { select: { words: true } },
          },
        },
      },
    })

    if (!wordBook) {
      throw new NotFoundException('词书不存在')
    }

    return wordBook.units.map(toUnitSummary)
  }

  async findUnit(id: string): Promise<UnitDetailDto> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      select: {
        ...unitFields,
        wordBookId: true,
        _count: { select: { words: true } },
      },
    })

    if (!unit) {
      throw new NotFoundException('单元不存在')
    }

    const nextUnit = await this.prisma.unit.findFirst({
      where: {
        wordBookId: unit.wordBookId,
        order: { gt: unit.order },
      },
      orderBy: { order: 'asc' },
      select: { id: true },
    })

    return {
      id: unit.id,
      name: unit.name,
      order: unit.order,
      wordCount: unit._count.words,
      wordBookId: unit.wordBookId,
      nextUnitId: nextUnit?.id ?? null,
    }
  }

  async findUnitWords(unitId: string): Promise<UnitWordsResponseDto> {
    const unit = await this.prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        ...unitFields,
        _count: { select: { words: true } },
        words: {
          orderBy: { order: 'asc' },
          select: wordFields,
        },
      },
    })

    if (!unit) {
      throw new NotFoundException('单元不存在')
    }

    return {
      unit: toUnitSummary(unit),
      words: unit.words.map(toWord),
      total: unit.words.length,
    }
  }
}
