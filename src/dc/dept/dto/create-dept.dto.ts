import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDeptDto {
  @IsNotEmpty({message: 'deptName不能为空'})
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