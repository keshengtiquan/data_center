import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';

@Module({
  controllers: [SectorController],
  providers: [SectorService],
  exports: [SectorService],
})
export class SectorModule {}
