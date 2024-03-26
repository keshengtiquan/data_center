import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PickType(CreateTenantDto, [
  'companyName',
  'contactPhone',
  'contactUserName',
  'tenantPackageId',
]) {
  @ApiProperty({ description: '项目ID' })
  id: number;
}
