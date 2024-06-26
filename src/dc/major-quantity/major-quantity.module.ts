import { Module } from '@nestjs/common';
import { MajorQuantityService } from './major-quantity.service';
import { MajorQuantityController } from './major-quantity.controller';

@Module({
  controllers: [MajorQuantityController],
  providers: [MajorQuantityService]
})
export class MajorQuantityModule {}
