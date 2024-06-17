import { Module } from '@nestjs/common';
import { NewSectorService } from './new-sector.service';
import { NewSectorController } from './new-sector.controller';

@Module({
  controllers: [NewSectorController],
  providers: [NewSectorService]
})
export class NewSectorModule {}
