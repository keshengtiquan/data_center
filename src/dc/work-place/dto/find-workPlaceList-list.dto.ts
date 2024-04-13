import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindWorkPlaceListListDto extends PaginationDto {
  @IsNotEmpty({ message: '工点ID不能为空' })
  @Type(() => Number)
  workPlaceId: number;

  @IsOptional()
  listCharacteristic: string;

  @IsOptional()
  listCode: string;

  @IsOptional()
  listName: string;
}
