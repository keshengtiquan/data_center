import { Module } from '@nestjs/common';
import { TaskService } from './task.service';

@Module({
  controllers: [],
  providers: [TaskService,],
  exports: [TaskService],
})
export class TaskModule {}
