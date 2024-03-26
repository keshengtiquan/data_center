import { PartialType } from '@nestjs/swagger';
import { CreateTenantPackageDto } from './create-tenant-package.dto';

export class UpdateTenantPackageDto extends PartialType(
  CreateTenantPackageDto,
) {
  id: number;
}
