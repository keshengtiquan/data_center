import { Module } from '@nestjs/common';
import { GanttService } from './gantt.service';
import { GanttController } from './gantt.controller';

@Module({
  controllers: [GanttController],
  providers: [GanttService]
})
export class GanttModule {}
