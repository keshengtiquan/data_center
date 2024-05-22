import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportWorkPlaceListDto {
  @IsOptional()
  @Type(() => String) // 转换为Number类型
  sectionalEntry: string;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  current: number;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  pageSize: number;
}