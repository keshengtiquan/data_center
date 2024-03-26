import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindTenantListDto extends PaginationDto {
  @ApiPropertyOptional({ description: '项目名称' })
  @IsOptional()
  companyName: string;

  @ApiPropertyOptional({ description: '状态', enum: ['0', '1'] })
  @IsOptional()
  status: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  contactUserName: string;
}
