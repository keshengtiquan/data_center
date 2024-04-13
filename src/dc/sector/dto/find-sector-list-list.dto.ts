import { IsOptional } from 'class-validator';

export class FindSectorListListDto  {
  @IsOptional()
  divisions: string;

  @IsOptional()
  workPlaces: string;
}