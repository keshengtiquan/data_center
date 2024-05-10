import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindWorkPlaceListDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  listId: number;

  @IsOptional()
  isPage: boolean = false;
}
