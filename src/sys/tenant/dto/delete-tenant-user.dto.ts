import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class DeleteTenantUserDto {
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;

  @IsNotEmpty()
  @Type(() => Number)
  tenantId: number;
}
