import { Injectable, NotFoundException } from '@nestjs/common'
import { WordStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { DashboardDto, DashboardQueryDto } from './dto/dashboard.dto'

function getBusinessTimeZone(): string {
  return process.env.BUSINESS_TIME_ZONE ?? 'Asia/Shanghai'
}

function getDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== 'literal') {
        result[part.type] = part.value
      }
      return result
    }, {})

  return `${parts.year}-${parts.month}-${parts.day}`
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

function countStreak(completedAt: Date[], now: Date, timeZone: string): number {
  const completedDays = new Set(
    completedAt.map((date) => getDateKey(date, timeZone)),
  )
  let currentDay = getDateKey(now, timeZone)
  let streak = 0

  while (completedDays.has(currentDay)) {
    streak += 1
    currentDay = shiftDateKey(currentDay, -1)
  }

  return streak
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(dto: DashboardQueryDto): Promise<DashboardDto> {
    const learner = await this.prisma.learner.findUnique({
      where: { publicId: dto.learnerId },
      select: { id: true, dailyGoal: true },
    })

    if (!learner) {
      throw new NotFoundException('学习者不存在')
    }

    const now = new Date()
    const businessTimeZone = getBusinessTimeZone()
    const today = getDateKey(now, businessTimeZone)
    const [sessions, masteredWordCount, reviewDueCount, wordBook] = await Promise.all([
      this.prisma.studySession.findMany({
        where: { learnerId: learner.id, completedAt: { not: null } },
        select: { totalCount: true, completedAt: true },
      }),
      this.prisma.wordProgress.count({
        where: { learnerId: learner.id, status: WordStatus.MASTERED },
      }),
      this.prisma.wordProgress.count({
        where: { learnerId: learner.id, nextReviewAt: { lte: now } },
      }),
      this.prisma.wordBook.findFirst({
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          units: {
            select: {
              _count: { select: { words: true } },
              words: {
                select: {
                  progresses: {
                    where: { learnerId: learner.id, status: WordStatus.MASTERED },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }),
    ])

    const completedDates = sessions.flatMap((session) =>
      session.completedAt ? [session.completedAt] : [],
    )
    const todayLearnedCount = sessions
      .filter(
        (session) =>
          session.completedAt && getDateKey(session.completedAt, businessTimeZone) === today,
      )
      .reduce((total, session) => total + session.totalCount, 0)

    let currentWordBook: DashboardDto['currentWordBook'] = null
    if (wordBook) {
      const totalWordCount = wordBook.units.reduce(
        (total, unit) => total + unit._count.words,
        0,
      )
      const masteredCount = wordBook.units.reduce(
        (total, unit) =>
          total + unit.words.reduce((unitTotal, word) => unitTotal + word.progresses.length, 0),
        0,
      )
      currentWordBook = {
        id: wordBook.id,
        name: wordBook.name,
        totalWordCount,
        masteredWordCount: masteredCount,
        completionPercent:
          totalWordCount === 0 ? 0 : Math.round((masteredCount / totalWordCount) * 100),
      }
    }

    return {
      todayLearnedCount,
      dailyGoal: learner.dailyGoal,
      streakDays: countStreak(completedDates, now, businessTimeZone),
      masteredWordCount,
      reviewDueCount,
      hasLearningHistory: sessions.length > 0,
      currentWordBook,
    }
  }
}
