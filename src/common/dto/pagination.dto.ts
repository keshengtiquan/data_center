import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @Min(1, { message: 'pageSize最小值为1' })
  @IsInt({ message: 'pageSize必须是数字' })
  @Type(() => Number)
  @IsOptional()
  readonly pageSize?: number = 10;

  @Min(1, { message: 'current最小值为1' })
  @IsInt({ message: 'current必须是数字' })
  @Type(() => Number)
  @IsOptional()
  readonly current?: number = 1;
}
