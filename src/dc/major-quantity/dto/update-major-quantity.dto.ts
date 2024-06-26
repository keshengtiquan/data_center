import { PartialType } from '@nestjs/swagger';
import { CreateMajorQuantityDto } from './create-major-quantity.dto';

export class UpdateMajorQuantityDto extends PartialType(CreateMajorQuantityDto) {}
