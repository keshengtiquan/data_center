import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindListDto extends PaginationDto {
  @IsOptional()
  nickName: string;
  @IsOptional()
  userName: string;
  @IsOptional()
  @Type(() => Number)
  tenantId: number;
  @IsOptional()
  @Type(() => Number)
  companyDeptId: number;

  @IsOptional()
  status: string;
}
