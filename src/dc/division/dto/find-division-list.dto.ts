import { IsOptional } from 'class-validator';

export class FindDivisionListDto {
  @IsOptional()
  divisionType: string
}