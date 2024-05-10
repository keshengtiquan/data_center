import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { WorkPlaceModule } from '../work-place/workPlace.module';

@Module({
  imports: [WorkPlaceModule],
  controllers: [SectorController],
  providers: [SectorService],
  exports: [SectorService],
})
export class SectorModule {}
