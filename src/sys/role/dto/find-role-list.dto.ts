import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindRoleListDto extends PaginationDto {
  @IsOptional()
  roleName: string;

  @IsOptional()
  status: string;
}
