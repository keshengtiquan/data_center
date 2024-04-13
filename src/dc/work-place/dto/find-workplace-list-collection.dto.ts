import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindWorkPlaceListCollectionDto extends PaginationDto {
  @IsOptional()
  sectionalEntry: string;
}
