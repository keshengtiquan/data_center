import { Type } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class AddUserDto {
  @IsOptional()
  @Type(() => Number)
  roleId: number;

  @IsOptional()
  @IsArray()
  userIds: number[];
}