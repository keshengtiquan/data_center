import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDivisionDto {
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
