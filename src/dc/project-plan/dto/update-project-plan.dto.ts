import { PartialType } from '@nestjs/swagger';
import { CreateProjectPlanDto } from './create-project-plan.dto';

export class UpdateProjectPlanDto extends PartialType(CreateProjectPlanDto) {}
