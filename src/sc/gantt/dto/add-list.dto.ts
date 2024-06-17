import {IsNotEmpty} from "class-validator";
import {PaginationDto} from "../../../common/dto/pagination.dto";
import {Type} from "class-transformer";

export class AddListDto {
  @IsNotEmpty({message: '清单id不能为空'})
  listIds: number[]
  
  @IsNotEmpty({message: '任务ID不能为空'})
  id: number
}

export class GetListDto extends PaginationDto{
  @IsNotEmpty({message: 'id不能为空'})
  @Type(() => Number)
  id: number
}