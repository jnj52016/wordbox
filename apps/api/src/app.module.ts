import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from './health.controller'
import { LearnersModule } from './learners/learners.module'
import { PrismaModule } from './prisma/prisma.module'
import { ReviewModule } from './review/review.module'
import { StudyModule } from './study/study.module'
import { WordBooksModule } from './word-books/word-books.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    LearnersModule,
    WordBooksModule,
    ReviewModule,
    StudyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
