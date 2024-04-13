import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { TaskService } from 'src/task/task.service';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTaskListDto } from './dto/find-Task-list.dto';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
// import { LogService } from 'src/log/log.service';

@Injectable()
export class SysTaskService implements OnModuleInit {
  @Inject(TaskService)
  private readonly taskService: TaskService;
  @Inject(ModuleRef)
  private readonly moduleRef: ModuleRef;
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async onModuleInit() {
    console.log('重启');
    const tasks = await this.prisma.task.findMany({
      where: {
        deleteflag: 0,
      },
    });
    const jobs = await this.taskService.getAllCronJobs();
    tasks.forEach(async (task) => {
      if (!jobs.has(task.taskName)) {
        this.createJob(task, task.jobStatus === '0' ? true : false);
      }
    });
  }

  /**
   * 修改任务状态
   * @param taskName
   * @param status
   */
  async changeStatus(id: number, taskName: string, status: string) {
    if (status === '1') {
      await this.taskService.stopCronJob(taskName);
    } else if (status === '0') {
      await this.taskService.startCronJob(taskName);
    }

    await this.prisma.task.update({
      where: { id },
      data: { jobStatus: status },
    });
  }

  /**
   * 创建job
   */
  async createJob(
    createJob: {
      actionClass: string;
      taskName: string;
      cronExpression: string;
      operatingParams?: string;
    },
    enabled: boolean,
  ) {
    const [service, method] = createJob.actionClass.split('.');
    const serviceInstance = this.moduleRef.get(service);

    this.taskService.addCronJob(
      createJob.taskName,
      createJob.cronExpression,
      serviceInstance[method].bind(this, { current: 1, pageSize: 10 }),
      enabled,
    );
  }
  /**
   * 创建任务
   * @param createTaskDto
   * @returns
   */
  async create(createTaskDto: CreateTaskDto) {
    const userInfo = this.cls.get('headers').user as User;

    await this.createJob(createTaskDto, true);

    const find = await this.prisma.task.findFirst({
      where: {
        actionClass: createTaskDto.actionClass,
        deleteflag: 0,
      }, 
    });
    if (find) {
      throw new BadRequestException('任务已存在，请不要重复配置');
    }

    const list = await this.prisma.task.create({
      data: {
        cronExpression: createTaskDto.cronExpression,
        operatingParams: createTaskDto.operatingParams,
        actionClass: createTaskDto.actionClass,
        sortNumber: createTaskDto.sortNumber,
        taskName: createTaskDto.taskName,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
        paramsType: createTaskDto.paramsType,
      },
    });

    return list;
  }

  /**
   * 查询任务列表
   * @param FindTaskListDto
   * @returns
   */
  async findAll(findTaskListDto: FindTaskListDto) {
    const { current, pageSize, jobStatus, taskName } = findTaskListDto;
    const condition = {
      ...(jobStatus && { jobStatus: jobStatus }),
      ...(taskName && { taskName: { contains: taskName } }),
      deleteflag: 0,
    };
    const list = await this.prisma.task.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.task.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询任务
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.task.findUnique({
      where: { id },
    });
  }

  /**
   * 更新任务
   * @param id
   * @returns
   */
  async update(updateTaskDto: UpdateTaskDto) {
    const userInfo = this.cls.get('headers').user as User;
    await this.taskService.deleteCronJob(updateTaskDto.taskName)
    this.createJob(updateTaskDto, true)
    const jobs = await this.taskService.getAllCronJobs()
    if(!jobs.has(updateTaskDto.taskName)){
      throw new BadRequestException('任务更新失败')
    }
    return await this.prisma.task.update({
      where: { id: updateTaskDto.id },
      data: {
        cronExpression: updateTaskDto.cronExpression,
        jobStatus: updateTaskDto.jobStatus,
        sortNumber: updateTaskDto.sortNumber,
        updateBy: userInfo.userName,
        operatingParams: updateTaskDto.operatingParams,
        paramsType: updateTaskDto.paramsType,
      },
    });
  }

  /**
   * 删除任务
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.task.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除任务
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }
}
