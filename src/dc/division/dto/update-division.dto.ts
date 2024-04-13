import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class UpdateDivisionDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;
  @IsOptional()
  divisionCode: string;
  @IsNotEmpty({ message: 'divisionName不能为空' })
  divisionName: string;
  @IsNotEmpty({ message: 'divisionType不能为空' })
  divisionType: string;
  @IsOptional()
  @Type(() => Number)
  parentId: number;
}