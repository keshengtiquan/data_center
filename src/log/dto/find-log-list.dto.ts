import { IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class FindLogListDto extends PaginationDto {
  @IsOptional()
  category: string;

  @IsOptional()
  name: string;
}
