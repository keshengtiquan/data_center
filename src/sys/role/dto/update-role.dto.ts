import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;
  @IsOptional()
  remark: string;
  @IsNotEmpty({ message: 'roleKey不能为空' })
  roleKey: string;
  @IsNotEmpty({ message: 'roleName不能为空' })
  roleName: string;
  @IsOptional()
  @Type(() => Number)
  roleSort: number;
  @IsOptional()
  createBy: string;
  @IsOptional()
  createTime: string;
  @IsOptional()
  updateBy: string;
  @IsOptional()
  updateTime: string;
}
