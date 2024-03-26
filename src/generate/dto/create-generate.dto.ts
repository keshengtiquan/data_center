import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGenBasicDto {
  @IsOptional()
  id: number;
  @IsNotEmpty({ message: '表名不能为空' })
  dbTable: string;
  @IsNotEmpty({ message: '表名主键不能为空' })
  dbTableKey: string;
  @IsOptional()
  pluginName: string;
  @IsOptional()
  moduleName: string;
  @IsOptional()
  generateType: string;
  @IsOptional()
  module: string;
  @IsOptional()
  menuPId: number;
  @IsOptional()
  busName: string;
  @IsOptional()
  className: string;
  @IsOptional()
  formLayout: string;
  @IsOptional()
  authorName: string;
  @IsOptional()
  gridWhether: string;
  @IsOptional()
  sortNumber: number;
}
