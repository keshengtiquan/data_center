import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Matches, MaxLength } from 'class-validator';
import { NAME_REGEX, TEL_REGEX } from 'src/common/constant';

export class CreateTenantDto {
  @ApiProperty({ description: '项目名称' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(50, { message: '项目名称不能超过50个字符' })
  companyName: string;

  @ApiProperty({ description: '联系人姓名' })
  @IsNotEmpty({ message: '联系人姓名不能为空' })
  @MaxLength(10, { message: '联系人姓名不能超过10个字符' })
  contactUserName: string;

  @ApiProperty({ description: '联系人电话' })
  @IsNotEmpty({ message: '联系人电话不能为空' })
  @Matches(TEL_REGEX, { message: '联系人电话格式不正确' })
  contactPhone: string;

  @ApiProperty({ description: '项目管理员' })
  @IsNotEmpty({ message: '项目管理员不能为空' })
  @Matches(NAME_REGEX, { message: '用户名不正确，长度在5-20之间' })
  userName: string;

  @ApiProperty({ description: '项目管理员密码' })
  @IsNotEmpty({ message: '项目管理员密码不能为空' })
  password: string;

  @ApiProperty({ description: '套餐ID' })
  @IsNotEmpty({ message: '套餐ID不能为空' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '套餐ID必须为数字' },
  )
  tenantPackageId: number;
}
