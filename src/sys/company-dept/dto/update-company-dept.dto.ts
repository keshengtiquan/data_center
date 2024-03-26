import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDeptDto } from './create-company-dept.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCompanyDeptDto extends PartialType(CreateCompanyDeptDto) {
  @IsNotEmpty({ message: 'id不能为空' })
  id: number;
}
