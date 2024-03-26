import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTenantPackageDto {
  @ApiProperty()
  @IsNotEmpty({ message: '套餐名称不能为空' })
  packageName: string;

  @ApiPropertyOptional()
  remark: string;

  @ApiPropertyOptional()
  menuIds: string;
}
