import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as dayjs from 'dayjs';
import mysqldump from 'mysqldump';

@Injectable()
export class TaskService {
  constructor(protected schedulerRegistry: SchedulerRegistry) {}
  @Inject(ConfigService)
  private configService: ConfigService;

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  backDataBase() {
    mysqldump({
      connection: {
        host: this.configService.get('mysql_server_host'), // 数据库地址
        port: this.configService.get('mysql_server_port'), // 数据库端口
        user: this.configService.get('mysql_server_username'), // 数据库帐号
        password: this.configService.get('mysql_server_password'), // 数据库密码
        database: this.configService.get('mysql_server_database'), // 数据库表名
      },
      dumpToFile: `./backSql/data_center_${dayjs(new Date()).format("YYYY-MM-DD")}.sql`, // 存入的文件目录
      dump: {
        tables: ['dev_log', 'gen_basic', 'gen_config', '_prisma_migrations'],
        excludeTables: true
      } 
    }).then(() => {
    })
  }

  stopCronJob(taskName: string) {
    const jobs = this.schedulerRegistry.getCronJobs();
    if (jobs.has(taskName)) {
      const job = this.schedulerRegistry.getCronJob(taskName);
      job.stop();
    } else {
      throw new BadRequestException('任务不存在');
    }
  }

  startCronJob(taskName: string) {
    const jobs = this.schedulerRegistry.getCronJobs();
    if (jobs.has(taskName)) {
      const job = this.schedulerRegistry.getCronJob(taskName);
      job.start();
    } else {
      throw new BadRequestException('任务不存在');
    }
  }

  getCronJob(taskName: string): any {
    return this.schedulerRegistry.getCronJob(taskName);
  }

  async getAllCronJobs(): Promise<any> {
    return await this.schedulerRegistry.getCronJobs();
  }

  addCronJob(taskName: string, cron: string, callback, enabled: boolean) {
    try {
      const job = new CronJob(cron, async () => {
        await callback();
      });
      this.schedulerRegistry.addCronJob(taskName, job as any);
      if (enabled) {
        job.start();
      }
    } catch (error) {
      let message = error.message;
      if (message.includes('Unknown alias')) {
        message = 'Cron表达式错误，请检查';
      } else if (message.includes('Too many fields')) {
        message = 'Cron表达式最多支持6位';
      }

      throw new BadRequestException(message);
    }
  }

  async deleteCronJob(taskName: string) {
    const jobs = this.schedulerRegistry.getCronJobs();
    if (jobs.has(taskName)) {
      this.schedulerRegistry.deleteCronJob(taskName);
    } else {
      throw new BadRequestException('更新出错，请删除后重新创建');
    }
  }

 
}
