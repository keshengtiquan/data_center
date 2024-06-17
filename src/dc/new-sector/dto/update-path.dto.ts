import {IsNotEmpty} from "class-validator";
import {Transform} from "class-transformer";

export class UpdatePathDto {
  @IsNotEmpty({message: '区段名称不能为空'})
  sectorName: string
  
  @IsNotEmpty({message: 'path不能为空'})
  @Transform(({value}) => {
    return JSON.stringify(value)
  })
  path: string
}