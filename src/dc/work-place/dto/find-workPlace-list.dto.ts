import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindWorkPlaceListDto extends PaginationDto {
  @IsOptional()
  workPlaceName: string;

  @IsOptional()
  workPlaceType: string;
}
