import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForbiddenTenantDto {
  @ApiProperty({ description: '用户id' })
  @IsNotEmpty({ message: 'id不能为空' })
  id: number;

  @ApiProperty({ description: '状态', enum: ['0', '1'], example: '1' })
  @IsNotEmpty({ message: '状态不能为空' })
  status: string;
}
