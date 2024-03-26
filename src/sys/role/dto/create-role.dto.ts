import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
// import { RoleNotExistsRule } from '../rules/role-not-exist.rule';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  // @RoleNotExistsRule({ message: '角色名称已存在' })
  roleName: string;

  @ApiProperty({ description: '角色标识' })
  @IsNotEmpty({ message: '角色标识不能为空' })
  roleKey: string;

  @ApiProperty({ description: '角色排序' })
  @IsNotEmpty({ message: '角色排序不能为空' })
  @IsInt({ message: '角色排序必须为数字' })
  @Type(() => Number)
  roleSort: number;

  @ApiPropertyOptional()
  @IsOptional()
  remark: string;
}
