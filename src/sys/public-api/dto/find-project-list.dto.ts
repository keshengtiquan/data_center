import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindListDto extends PaginationDto {
  @IsOptional()
  listCharacteristic: string;

  @IsOptional()
  listCode: string;

  @IsOptional()
  listName: string;

  // 查询分项工程下的清单
  @IsOptional()
  sectionalEntry: string;

  @IsOptional()
  @Transform(({ value }) => {
    return value.map((item) => Number(item));
  })
  listIds: number[];


  @IsOptional()
  @Transform(({ value }) => {
    return value.map((item) => Number(item));
  })
  notInIds: number[];
}
