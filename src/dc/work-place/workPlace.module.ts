import { Module } from '@nestjs/common';
import { WorkPlaceService } from './workPlace.service';
import { WorkPlaceController } from './workPlace.controller';

@Module({
  controllers: [WorkPlaceController],
  providers: [WorkPlaceService],
  exports: [WorkPlaceService],
})
export class WorkPlaceModule {}
