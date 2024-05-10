import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindSectorListDto extends PaginationDto {
  @IsOptional()
  sectorName?: string;
}
