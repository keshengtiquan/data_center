import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSectorDto {
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

  @IsNotEmpty({ message: '至少选择一个车站或区间' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    } else {
      return value;
    }
  })
  workPlaces: string;
}
