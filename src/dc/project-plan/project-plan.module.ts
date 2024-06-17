import { Module } from '@nestjs/common';
import { ProjectPlanService } from './project-plan.service';
import { ProjectPlanController } from './project-plan.controller';

@Module({
  controllers: [ProjectPlanController],
  providers: [ProjectPlanService]
})
export class ProjectPlanModule {}
