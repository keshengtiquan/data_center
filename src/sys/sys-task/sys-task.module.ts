import { DynamicModule, Module } from '@nestjs/common';
import { SysTaskService } from './sys-task.service';
import { SysTaskController } from './sys-task.controller';
import { TaskModule } from 'src/task/task.module';
// import { LogModule } from 'src/log/log.module';
// import { LogService } from 'src/log/log.service';
import { taskProviders } from './task';

@Module({})
export class SysTaskModule {
  static forRoot(): DynamicModule {
    return {
      module: SysTaskModule,
      imports: [TaskModule],
      controllers: [SysTaskController],
      providers: [
        SysTaskService,...taskProviders
      ],
    };
  }
}
