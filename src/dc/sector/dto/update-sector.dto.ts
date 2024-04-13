import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateSectorDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;
  @IsOptional()
  @Type(() => Number)
  deptId: number;
  
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    } else {
      return value;
    }
  })
  divisions: string;
  
  @IsNotEmpty({ message: 'sectorName不能为空' })
  sectorName: string;
  
  @IsOptional()
  @Type(() => Number)
  sortNumber: number;
  
  @IsNotEmpty({ message: 'workPlaces不能为空' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    } else {
      return value;
    }
  })
  workPlaces: string;
  
}