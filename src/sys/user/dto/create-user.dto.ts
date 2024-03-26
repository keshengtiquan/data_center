import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsNotExistsRule } from 'src/common/rules/is-not-exist.rule';
import { md5 } from 'src/utils/md5';

export class CreateUserDto {
  @ApiProperty()
  @IsNotExistsRule('user', { message: '用户名已存在' })
  @IsNotEmpty({ message: '用户名不能为空' })
  userName: string;

  @ApiProperty()
  @IsNotEmpty({ message: '密码不能为空' })
  @Transform((params) => {
    const p = md5(params.value);
    return p;
  })
  password: string;

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
  remark: string;

  @Type(() => Number)
  @IsOptional()
  companyDeptId: number;

  @Type(() => Number)
  @IsOptional()
  defaultProjectId: number;
}
