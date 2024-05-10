import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindFileListDto extends PaginationDto {
  @Type(() => Number)
  parentId?: number;
}
