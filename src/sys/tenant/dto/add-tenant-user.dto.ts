import { IsNotEmpty } from 'class-validator';

export class AddTenantUserDto {
  @IsNotEmpty({ message: '项目ID不能为空' })
  tenantId: number;

  @IsNotEmpty({ message: '用户ID不能为空' })
  userIds: number[];
}
