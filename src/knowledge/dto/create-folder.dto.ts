import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateFolderDto {
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  fileName: string;

  @IsOptional()
  @Type(() => Number)
  sortNumber: number;

}