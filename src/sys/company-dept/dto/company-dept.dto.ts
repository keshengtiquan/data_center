import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindTreeNodeDto extends PaginationDto {
  @Type(() => Number)
  parentId: number;

  @IsOptional()
  deptName: string;
}
