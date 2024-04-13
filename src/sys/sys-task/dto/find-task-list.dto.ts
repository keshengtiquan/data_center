import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindTaskListDto extends PaginationDto{
  @IsOptional()
  jobStatus: string;

  @IsOptional()
  taskName: string;

}