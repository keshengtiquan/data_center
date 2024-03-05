import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindListDto extends PaginationDto {
  @IsOptional()
  nickName: string;
  @IsOptional()
  userName: string;
}
