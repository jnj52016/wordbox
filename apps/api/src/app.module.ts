import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from './health.controller'
import { PrismaModule } from './prisma/prisma.module'
import { WordBooksModule } from './word-books/word-books.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    WordBooksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
