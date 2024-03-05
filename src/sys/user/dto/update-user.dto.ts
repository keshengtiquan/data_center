import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: '用户id不能为空' })
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  nickName: string;

  @ApiPropertyOptional()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  gender: string;

  @ApiPropertyOptional()
  @IsOptional()
  avatar: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  createDept: number;

  @ApiPropertyOptional()
  @IsOptional()
  remark: string;

  @ApiPropertyOptional()
  @IsOptional()
  deptId: number;

  @ApiPropertyOptional()
  @IsOptional()
  roleIds: number[];
}
