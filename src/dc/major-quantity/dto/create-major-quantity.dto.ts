import {IsNotEmpty, IsOptional} from "class-validator";

export class CreateMajorQuantityDto {
  @IsNotEmpty({message: '父级ID不能为空'})
  parentId: number
  @IsOptional()
  index: string
  
  @IsOptional()
  name: string
  
  @IsOptional()
  unit: string
}
