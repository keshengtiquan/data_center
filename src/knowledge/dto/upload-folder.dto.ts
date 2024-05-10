import { Type } from 'class-transformer';
import { CreateFolderDto } from './create-folder.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UploadFolderDto extends PartialType(CreateFolderDto) {
  @Type(() => Number)
  id: number;
}
