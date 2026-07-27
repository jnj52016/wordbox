import { Module } from '@nestjs/common'
import { ProgressController, StudyController } from './study.controller'
import { StudyService } from './study.service'

@Module({
  controllers: [StudyController, ProgressController],
  providers: [StudyService],
})
export class StudyModule {}
