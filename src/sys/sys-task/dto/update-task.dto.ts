import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateTaskDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;

  @IsOptional()
  actionClass: string;

  @IsOptional()
  jobStatus: string;

  @IsOptional()
  @Type(() => Number)
  sortNumber: number;

  @IsOptional()
  taskName: string;

  @IsNotEmpty({message: '表达式不能为空'})
  cronExpression: string;

  @IsOptional()
  operatingParams: string

  @IsOptional()
  paramsType: string
}
