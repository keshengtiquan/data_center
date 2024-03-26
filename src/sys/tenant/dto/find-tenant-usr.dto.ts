import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindTenantUserDto extends PaginationDto {
  @Type(() => Number)
  tenantId: number;
}
