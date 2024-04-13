import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateWorkPlaceDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;
  
  @IsOptional()
  workPlaceCode: string;
  
  @IsNotEmpty({ message: 'workPlaceName不能为空' })
  workPlaceName: string;
  
  @IsOptional()
  workPlaceType: string;
  
  @IsOptional()
  @Type(() => Number)
  sortNumber: number;
  
}