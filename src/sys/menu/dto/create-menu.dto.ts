import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty({ message: '菜单名称不能为空' })
  title: string;

  @IsOptional()
  icon: string;

  @IsOptional()
  path: string;

  @IsOptional()
  component: string;

  @IsOptional()
  name: string;

  @IsOptional()
  hideInMenu: boolean;

  @IsOptional()
  @Type(() => Number)
  parentId: number;

  @IsOptional()
  isIframe: boolean;

  @IsOptional()
  url: string;

  @IsOptional()
  affix: boolean;

  @IsOptional()
  hideInBreadcrumb: boolean;

  @IsOptional()
  hideChildrenInMenu: boolean;

  @IsOptional()
  keepAlive: boolean;

  @IsOptional()
  target: string;

  @IsOptional()
  redirect: string;

  @IsNotEmpty({ message: '排序不能为空' })
  menuSort: number;

  @IsOptional()
  permission: string;

  @IsOptional()
  status: string;

  @IsNotEmpty({ message: '菜单类型不能为空' })
  menuType: string;

  @IsOptional()
  module: string;
}
