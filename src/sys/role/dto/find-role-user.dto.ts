import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindRoleUserDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  roleId: number;

}
