import { Type } from 'class-transformer';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateListDto {
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

  // excel 导入时可以给清单添加分部分项，这里是中文名
  @IsOptional()
  divisionName: string;
}
