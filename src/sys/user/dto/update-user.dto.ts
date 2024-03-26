import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: '用户id不能为空' })
  id: number;

  @IsOptional()
  userName: string;

  @IsOptional()
  nickName: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  avatar: string;

  @IsOptional()
  remark: string;

  @Type(() => Number)
  @IsOptional()
  companyDeptId: number;

  @Type(() => Number)
  @IsOptional()
  defaultProjectId: number;
}
