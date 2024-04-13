import { IsNotEmpty, IsOptional } from "class-validator";

export class SaveWorkPlaceListQuantities {
  @IsNotEmpty({message: 'ID不能为空'})
  id: number;

  @IsOptional()
  allQuantities: number;

  @IsOptional()
  leftQuantities: number;

  @IsOptional()
  rightQuantities: number;
}
