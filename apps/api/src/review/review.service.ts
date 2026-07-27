import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ReviewQueueDto, ReviewQueueQueryDto } from './dto/review.dto'

const reviewWordFields = {
  id: true,
  spelling: true,
  phonetic: true,
  meaning: true,
  partOfSpeech: true,
  example: true,
  exampleZh: true,
  imageUrl: true,
  emoji: true,
} as const

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findQueue(dto: ReviewQueueQueryDto): Promise<ReviewQueueDto> {
    const learner = await this.prisma.learner.findUnique({
      where: { publicId: dto.learnerId },
      select: { id: true },
    })

    if (!learner) {
      throw new NotFoundException('学习者不存在')
    }

    const progresses = await this.prisma.wordProgress.findMany({
      where: {
        learnerId: learner.id,
        nextReviewAt: { lte: new Date() },
      },
      orderBy: [{ nextReviewAt: 'asc' }, { wrongCount: 'desc' }],
      select: {
        status: true,
        correctCount: true,
        wrongCount: true,
        lastSeenAt: true,
        nextReviewAt: true,
        word: { select: reviewWordFields },
      },
    })

    return {
      total: progresses.length,
      words: progresses.flatMap((progress) =>
        progress.nextReviewAt
          ? [
              {
                ...progress.word,
                status: progress.status,
                correctCount: progress.correctCount,
                wrongCount: progress.wrongCount,
                lastSeenAt: progress.lastSeenAt,
                nextReviewAt: progress.nextReviewAt,
              },
            ]
          : [],
      ),
    }
  }
}
