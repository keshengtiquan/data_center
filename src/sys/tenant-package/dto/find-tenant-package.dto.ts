import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindPackageListDto extends PaginationDto {
  @IsOptional()
  packageName?: string;
}
