import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CreateDictDto {
  @IsOptional()
  parentId: number;

  dictLabel: string;
  dictValue: string;

  @Type(() => Number)
  sortNumber: number;
}
