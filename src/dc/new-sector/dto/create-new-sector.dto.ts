import {IsNotEmpty, IsOptional} from "class-validator";
import {Transform} from "class-transformer";

export class CreateNewSectorDto {
  @IsNotEmpty({message: '区段名称不能为空'})
  sectorName: string
  
  @IsOptional()
  @Transform(({value}) => {
    return JSON.stringify(value)
  })
  path: string
  
  @IsOptional()
  workPlaces: number[]
  
  @IsOptional()
  color: string
  
  @IsOptional()
  whetherInclude: boolean[]
  
  @IsOptional()
  workPlaceNames: string[]
}
