import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportListDto {
  @IsOptional()
  listCode: string;

  @IsOptional()
  listName: string;
  
  @IsOptional()
  listCharacteristic: string;

  @IsOptional()
  sectionalEntry: string;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  current: number;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  pageSize: number;

  @IsOptional()
  ids: number[];
}
