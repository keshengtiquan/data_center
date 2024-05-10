import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ExportUserDto {
  @IsOptional()
  nickName: string;

  @IsOptional()
  userName: string;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  current: number;

  @IsOptional()
  @Type(() => Number) // 转换为Number类型
  pageSize: number;

  @IsOptional()
  status: string;

  @IsOptional()
  ids: number[]
}