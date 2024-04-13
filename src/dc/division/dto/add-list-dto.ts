import { Transform } from 'class-transformer'
import { IsArray, IsNotEmpty } from 'class-validator'

export class AddListDto {
  @IsNotEmpty({ message: '分部分项名称不能为空' })
  @IsArray({ message: '分部分项名称必须是数组' })
  @Transform(({value}) => {
    return JSON.parse(value)
  })
  parentNames: number[]

  @IsNotEmpty({ message: '清单编码不能为空' })
  @IsArray({ message: '清单编码必须是数组' })
  listIds: number[]

}