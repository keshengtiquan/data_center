import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateDeptDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;

  @IsNotEmpty({ message: 'deptName不能为空' })
  deptName: string;
  
  @IsOptional()
  deptType: string;
  
  @IsOptional()
  @Type(() => Number)
  parentId: number;
  
  @IsOptional()
  @Type(() => Number)
  sortNumber: number;

  @IsOptional()
  @Type(() => Number)
  leaderId: number
}