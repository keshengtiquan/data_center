import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateWorkPlaceDto {
  @IsOptional()
  workPlaceCode: string;
  
  @IsNotEmpty({message: 'workPlaceName不能为空'})
  workPlaceName: string;
  
  @IsOptional()
  workPlaceType: string;
  
  @IsOptional()
  @Type(() => Number)
  sortNumber: number;
  
}