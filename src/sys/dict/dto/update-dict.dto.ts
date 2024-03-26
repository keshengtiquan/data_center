import { PartialType } from '@nestjs/swagger';
import { CreateDictDto } from './create-dict.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateDictDto extends PartialType(CreateDictDto) {
  @IsNotEmpty({ message: '字典id不能为空' })
  id: number;
}
