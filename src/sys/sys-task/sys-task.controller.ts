import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SysTaskService } from './sys-task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindTaskListDto } from './dto/find-task-list.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { Result } from 'src/common/result';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('任务管理')
@Controller('task')
export class SysTaskController {
  constructor(private readonly sysTaskService: SysTaskService) {}

  // @Post('/cron/job/add')
  // addJob() {
  //   return this.sysTaskService.addJob();
  // }

  @ApiOperation({ summary: '创建任务' })
  @ApiBearerAuth()
  @Auth()
  @Post('/cron/job/changeStatus')
  @HttpCode(HttpStatus.OK)
  @OpLog('修改任务状态')
  async changeStatus(@Body('id')id: number, @Body('taskName') taskName: string, @Body('status') status: string){
    const data = await this.sysTaskService.changeStatus(id,taskName, status); 
    return Result.success(data, '修改任务状态成功');
  }

  @ApiOperation({ summary: '创建任务' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建任务')
  async create(@Body() createTaskDto: CreateTaskDto) {
    const data = await this.sysTaskService.create(createTaskDto);
    return Result.success(data, '创建任务成功');
  }

  @ApiOperation({ summary: '查询任务列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  async findAll(@Query() findTaskListDto: FindTaskListDto) {
    const data = await this.sysTaskService.findAll(findTaskListDto);
    return Result.success(data, '查询任务列表成功');
  }

  @ApiOperation({ summary: '根据ID查询任务' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.sysTaskService.findOne(id);
    return Result.success(data, '查询任务成功');
  }

  @ApiOperation({ summary: '更新任务' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新任务')
  async update(@Body() updateTaskDto: UpdateTaskDto) {
    const data = await this.sysTaskService.update(updateTaskDto);
    return Result.success(data, '更新任务成功');
  }

  @ApiOperation({ summary: '删除任务' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除任务')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.sysTaskService.remove(id);
    return Result.success(data, '删除任务成功');
  }

  @ApiOperation({ summary: '批量删除任务' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除任务')
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.sysTaskService.batchDelete(ids);
    return Result.success(data, '删除任务成功');
  }
}
