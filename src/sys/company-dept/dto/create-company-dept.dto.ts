import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDeptDto {
  @IsOptional()
  parentId: number;

  @IsNotEmpty({ message: '部门名称不能为空' })
  deptName: string;

  @IsOptional()
  leaderId: number;
  @IsOptional()
  deptType: string;
  @IsOptional()
  sortNumber: number;
}
