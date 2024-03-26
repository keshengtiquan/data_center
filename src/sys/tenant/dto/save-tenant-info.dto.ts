import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class SaveTenantInfoDto {
  @IsNotEmpty({ message: '项目ID不能为空' })
  @Type(() => Number)
  tenantId: number;

  @Length(1, 100, { message: '项目名称长度为1-100' })
  projectName: string;

  @IsOptional()
  projectAddress: string;

  manager: number;

  chiefEngineer: number;

  @IsOptional()
  developmentOrganization: string;

  @IsOptional()
  designOrganization: string;

  @IsOptional()
  supervisorOrganization: string;

  @IsOptional()
  safetyDirector: number;

  @IsOptional()
  developContact: string;

  @IsOptional()
  developAddress: string;

  @IsOptional()
  developTel: string;

  @IsOptional()
  designContact: string;

  @IsOptional()
  designAddress: string;

  @IsOptional()
  designTel: string;

  @IsOptional()
  supervisorContact: string;

  @IsOptional()
  supervisorAddress: string;

  @IsOptional()
  supervisorTel: string;

  @IsOptional()
  companyDeptId: number;

  @IsOptional()
  startDate: string;

  @IsOptional()
  endDate: string;

  @IsOptional()
  projectNature: string[];
}
