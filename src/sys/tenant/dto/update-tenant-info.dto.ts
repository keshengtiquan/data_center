import { IsOptional } from "class-validator";

export class UpdateTenantInfoDto {
  @IsOptional()
  developmentOrganization: string;

  @IsOptional()
  designOrganization: string;

  @IsOptional()
  supervisorOrganization: string;
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

}