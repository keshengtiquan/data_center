import { PartialType } from '@nestjs/swagger';
import { CreateNewSectorDto } from './create-new-sector.dto';

export class UpdateNewSectorDto extends PartialType(CreateNewSectorDto) {}
