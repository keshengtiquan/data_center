import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  actionClass: string;
  
  @IsOptional()
  jobStatus: string;
  
  @IsOptional()
  @Type(() => Number)
  sortNumber: number;
  
  @IsNotEmpty({message: '任务名称不能为空'})
  taskName: string;

  @IsOptional()
  operatingParams: string

  @IsNotEmpty({message: '表达式不能为空'})
  cronExpression: string
  
  @IsOptional()
  paramsType: string
}