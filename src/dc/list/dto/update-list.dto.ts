import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class UpdateListDto {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  @IsInt({ message: 'id应为整数' })
  id: number;

  @IsNotEmpty({ message: 'combinedPrice不能为空' })
  combinedPrice: number;
  @IsOptional()

  listCharacteristic: string;
  @IsOptional()
  listCode: string;

  @IsNotEmpty({ message: 'listName不能为空' })
  listName: string;

  @IsNotEmpty({ message: 'quantities不能为空' })
  @Type(() => Number)
  quantities: number;

  @IsOptional()
  @Type(() => Number)
  serialNumber: number;

  @IsNotEmpty({ message: 'unit不能为空' })
  unit: string;
  
  @IsNotEmpty({ message: 'unitPrice不能为空' })
  unitPrice: number;
}
