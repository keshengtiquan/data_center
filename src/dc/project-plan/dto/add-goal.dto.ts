import {IsNotEmpty} from "class-validator";

export class AddGoalDto {
  @IsNotEmpty({message: '字段不能为空'})
  filed: string
  
  value: string
}