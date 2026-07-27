import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { QuestionType, StudyMode, WordStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateStudySessionDto,
  StudyAnswerResultDto,
  StudyQuestionDto,
  StudySessionDto,
  SubmitStudyAnswerDto,
  WordProgressDto,
} from './dto/study.dto'
import { calculateProgressUpdate, ProgressState } from './progress-rules'

const studySessionFields = {
  id: true,
  learnerId: true,
  unitId: true,
  mode: true,
  totalCount: true,
  correctCount: true,
  startedAt: true,
  completedAt: true,
  learner: { select: { publicId: true } },
  _count: { select: { answers: true } },
} as const

const studyWordFields = {
  id: true,
  spelling: true,
  phonetic: true,
  meaning: true,
  emoji: true,
  order: true,
} as const

const questionTypes = [QuestionType.EN_TO_ZH, QuestionType.ZH_TO_EN, QuestionType.SPELLING]

type StudyWord = {
  id: string
  spelling: string
  phonetic: string | null
  meaning: string
  emoji: string | null
  order: number
}

type ProgressRecord = ProgressState & {
  nextReviewAt: Date | null
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLocaleLowerCase()
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function uniqueAnswers(values: string[]): string[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = normalizeAnswer(value)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function toProgressDto(progress: ProgressRecord): WordProgressDto {
  return {
    status: progress.status,
    correctStreak: progress.correctStreak,
    correctCount: progress.correctCount,
    wrongCount: progress.wrongCount,
    nextReviewAt: progress.nextReviewAt,
  }
}

function toSessionDto(session: {
  id: string
  unitId: string | null
  mode: StudyMode
  totalCount: number
  correctCount: number
  startedAt: Date
  completedAt: Date | null
  learner: { publicId: string }
  _count: { answers: number }
}): StudySessionDto {
  if (!session.unitId) {
    throw new BadRequestException('学习 Session 缺少单元')
  }

  return {
    id: session.id,
    learnerId: session.learner.publicId,
    unitId: session.unitId,
    mode: session.mode,
    totalCount: session.totalCount,
    answeredCount: session._count.answers,
    correctCount: session.correctCount,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  }
}

@Injectable()
export class StudyService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateStudySessionDto): Promise<StudySessionDto> {
    const mode = dto.mode ?? StudyMode.LEARN
    if (mode !== StudyMode.LEARN) {
      throw new BadRequestException('当前仅支持学习模式')
    }

    const learner = await this.prisma.learner.findUnique({
      where: { publicId: dto.learnerId },
      select: { id: true },
    })

    if (!learner) {
      throw new NotFoundException('学习者不存在')
    }

    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      select: { id: true },
    })

    if (!unit) {
      throw new NotFoundException('单元不存在')
    }

    const words = await this.findSessionWords(dto.unitId, dto.count ?? 10)
    if (words.length === 0) {
      throw new BadRequestException('该单元暂无可学习的单词')
    }

    const session = await this.prisma.studySession.create({
      data: {
        learnerId: learner.id,
        unitId: dto.unitId,
        mode,
        totalCount: words.length,
      },
      select: studySessionFields,
    })

    return toSessionDto(session)
  }

  async getSession(id: string): Promise<StudySessionDto> {
    return toSessionDto(await this.findSession(id))
  }

  async getQuestions(id: string): Promise<StudyQuestionDto[]> {
    const session = await this.findSession(id)
    const words = await this.findSessionWords(session.unitId ?? '', session.totalCount)

    return words.map((word, index) => this.toQuestion(session.id, word, index, words))
  }

  async submitAnswer(
    sessionId: string,
    dto: SubmitStudyAnswerDto,
  ): Promise<StudyAnswerResultDto> {
    const session = await this.findSession(sessionId)
    const question = await this.findQuestion(session, dto.questionId)

    if (question.questionType !== dto.questionType) {
      throw new BadRequestException('题型与题目不匹配')
    }

    const correctAnswer = this.getCorrectAnswer(question.questionType, question.word)
    const isCorrect = normalizeAnswer(dto.answer) === normalizeAnswer(correctAnswer)

    return this.prisma.$transaction(async (tx) => {
      const existingAnswer = await tx.answerRecord.findFirst({
        where: { sessionId, wordId: question.word.id },
        select: {
          questionType: true,
          isCorrect: true,
        },
      })

      if (existingAnswer) {
        const progress = await tx.wordProgress.findUnique({
          where: {
            learnerId_wordId: {
              learnerId: session.learnerId,
              wordId: question.word.id,
            },
          },
        })

        if (!progress) {
          throw new NotFoundException('单词进度不存在')
        }

        return {
          questionId: dto.questionId,
          questionType: existingAnswer.questionType,
          isCorrect: existingAnswer.isCorrect,
          correctAnswer,
          duplicate: true,
          progress: toProgressDto(progress),
        }
      }

      if (session.completedAt) {
        throw new ConflictException('学习 Session 已完成')
      }

      const currentProgress = await tx.wordProgress.findUnique({
        where: {
          learnerId_wordId: {
            learnerId: session.learnerId,
            wordId: question.word.id,
          },
        },
      })
      const current: ProgressState = currentProgress ?? {
        status: WordStatus.NEW,
        correctStreak: 0,
        correctCount: 0,
        wrongCount: 0,
      }
      const progressUpdate = calculateProgressUpdate(current, isCorrect, new Date())

      await tx.answerRecord.create({
        data: {
          sessionId,
          wordId: question.word.id,
          questionType: dto.questionType,
          submittedAnswer: dto.answer.trim(),
          isCorrect,
        },
      })

      const progress = await tx.wordProgress.upsert({
        where: {
          learnerId_wordId: {
            learnerId: session.learnerId,
            wordId: question.word.id,
          },
        },
        create: {
          learnerId: session.learnerId,
          wordId: question.word.id,
          ...progressUpdate,
        },
        update: progressUpdate,
      })

      if (isCorrect) {
        await tx.studySession.update({
          where: { id: sessionId },
          data: { correctCount: { increment: 1 } },
        })
      }

      return {
        questionId: dto.questionId,
        questionType: dto.questionType,
        isCorrect,
        correctAnswer,
        duplicate: false,
        progress: toProgressDto(progress),
      }
    })
  }

  async completeSession(id: string): Promise<StudySessionDto> {
    const session = await this.findSession(id)

    if (session.completedAt) {
      return toSessionDto(session)
    }

    if (session._count.answers < session.totalCount) {
      throw new BadRequestException('尚未完成全部题目')
    }

    const completedSession = await this.prisma.studySession.update({
      where: { id },
      data: { completedAt: new Date() },
      select: studySessionFields,
    })

    return toSessionDto(completedSession)
  }

  private async findSession(id: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      select: studySessionFields,
    })

    if (!session) {
      throw new NotFoundException('学习 Session 不存在')
    }

    return session
  }

  private async findSessionWords(unitId: string, count: number): Promise<StudyWord[]> {
    if (!unitId) {
      throw new BadRequestException('学习 Session 缺少单元')
    }

    return this.prisma.word.findMany({
      where: { unitId },
      orderBy: { order: 'asc' },
      take: count,
      select: studyWordFields,
    })
  }

  private async findQuestion(
    session: Awaited<ReturnType<StudyService['findSession']>>,
    questionId: string,
  ): Promise<{ questionType: QuestionType; word: StudyWord }> {
    const prefix = `${session.id}:`
    if (!questionId.startsWith(prefix)) {
      throw new BadRequestException('题目不属于当前学习 Session')
    }

    const wordId = questionId.slice(prefix.length)
    const words = await this.findSessionWords(session.unitId ?? '', session.totalCount)
    const wordIndex = words.findIndex((word) => word.id === wordId)

    if (wordIndex < 0) {
      throw new BadRequestException('题目不属于当前学习 Session')
    }

    return {
      questionType: questionTypes[wordIndex % questionTypes.length],
      word: words[wordIndex],
    }
  }

  private toQuestion(
    sessionId: string,
    word: StudyWord,
    index: number,
    allWords: StudyWord[],
  ): StudyQuestionDto {
    const questionType = questionTypes[index % questionTypes.length]
    const correctAnswer = this.getCorrectAnswer(questionType, word)
    const candidateAnswers = allWords
      .filter((candidate) => candidate.id !== word.id)
      .map((candidate) => this.getCorrectAnswer(questionType, candidate))
    const options = shuffle(uniqueAnswers([correctAnswer, ...candidateAnswers])).slice(0, 4)

    const question: StudyQuestionDto = {
      questionId: `${sessionId}:${word.id}`,
      wordId: word.id,
      questionType,
      prompt: questionType === QuestionType.EN_TO_ZH ? word.spelling : word.meaning,
      phonetic: word.phonetic,
      emoji: word.emoji,
      options: questionType === QuestionType.SPELLING ? [] : options,
    }

    if (questionType === QuestionType.EN_TO_ZH) {
      question.spelling = word.spelling
    }

    return question
  }

  private getCorrectAnswer(questionType: QuestionType, word: StudyWord): string {
    return questionType === QuestionType.EN_TO_ZH ? word.meaning : word.spelling
  }
}
