import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLearnerDto } from './dto/create-learner.dto'
import { LearnerDto, ResetProgressResponseDto } from './dto/learner.dto'
import { UpdateLearnerSettingsDto } from './dto/update-learner-settings.dto'

const learnerFields = {
  publicId: true,
  dailyGoal: true,
  autoPronounce: true,
  createdAt: true,
  updatedAt: true,
} as const

type LearnerRecord = {
  publicId: string
  dailyGoal: number
  autoPronounce: boolean
  createdAt: Date
  updatedAt: Date
}

function toLearnerDto(learner: LearnerRecord): LearnerDto {
  return { ...learner }
}

@Injectable()
export class LearnersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGet(dto: CreateLearnerDto): Promise<LearnerDto> {
    const learner = await this.prisma.learner.upsert({
      where: { publicId: dto.publicId },
      update: {},
      create: { publicId: dto.publicId },
      select: learnerFields,
    })

    return toLearnerDto(learner)
  }

  async findByPublicId(publicId: string): Promise<LearnerDto> {
    const learner = await this.prisma.learner.findUnique({
      where: { publicId },
      select: learnerFields,
    })

    if (!learner) {
      throw new NotFoundException('学习者不存在')
    }

    return toLearnerDto(learner)
  }

  async updateSettings(
    publicId: string,
    dto: UpdateLearnerSettingsDto,
  ): Promise<LearnerDto> {
    await this.findByPublicId(publicId)

    const learner = await this.prisma.learner.update({
      where: { publicId },
      data: dto,
      select: learnerFields,
    })

    return toLearnerDto(learner)
  }

  async resetProgress(publicId: string): Promise<ResetProgressResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const learner = await tx.learner.findUnique({
        where: { publicId },
        select: { id: true },
      })

      if (!learner) {
        throw new NotFoundException('学习者不存在')
      }

      const [progress, sessions] = await Promise.all([
        tx.wordProgress.deleteMany({ where: { learnerId: learner.id } }),
        tx.studySession.deleteMany({ where: { learnerId: learner.id } }),
      ])

      return {
        deletedProgressCount: progress.count,
        deletedSessionCount: sessions.count,
      }
    })
  }
}
