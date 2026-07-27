import { Module } from '@nestjs/common'
import { UnitsController } from './units.controller'
import { WordBooksController } from './word-books.controller'
import { WordBooksService } from './word-books.service'

@Module({
  controllers: [WordBooksController, UnitsController],
  providers: [WordBooksService],
})
export class WordBooksModule {}
