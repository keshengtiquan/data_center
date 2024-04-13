import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindListListDto extends PaginationDto {
  @IsOptional()
  listCharacteristic: string;

  @IsOptional()
  listCode: string;

  @IsOptional()
  listName: string;

  // 查询分项工程下的清单
  @IsOptional()
  sectionalEntry: string;

  // 查询没有分配分部分项的清单
  @IsOptional()
  notDivision: boolean;

  // 查询同一工点下没有分配的清单
  // 传入工点ID
  @IsOptional()
  @Type(() => Number)
  workPlaceIdExclude: number;
}
