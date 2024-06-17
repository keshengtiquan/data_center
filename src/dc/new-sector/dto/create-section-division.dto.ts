import {IsNotEmpty} from "class-validator";

export class CreateSectionDivisionDto {
  @IsNotEmpty({message: '分部分项不能为空'})
  division: number[]
  
  @IsNotEmpty({message: '作业队ID不能为空'})
  deptId: number
  
  @IsNotEmpty({message: '区段ID不能为空'})
  sectorId: number
}