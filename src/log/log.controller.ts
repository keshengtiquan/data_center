import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { FindLogListDto } from './dto/find-log-list.dto';
import { Result } from 'src/common/result';

@ApiTags('日志管理')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @ApiOperation({ summary: '查询日志' })
  @ApiBasicAuth()
  @Get('/getlist')
  @Auth()
  async getlist(@Query() findLogListDto: FindLogListDto) {
    const data = await this.logService.getlist(findLogListDto);
    return Result.success(data, '获取列表成功');
  }

  @ApiOperation({ summary: '查询周统计' })
  @ApiBasicAuth()
  @Get('/getWeekChart')
  @Auth()
  async getWeekChart() {
    const data = await this.logService.getWeekChart();
    return Result.success(data, '获取周统计成功');
  }

  @ApiOperation({ summary: '查询周统计' })
  @ApiBasicAuth()
  @Get('/getColumnWeekChart')
  @Auth()
  async getColumnWeekChart() {
    const data = await this.logService.getColumnWeekChart();
    return Result.success(data, '获取周统计成功');
  }

  @ApiOperation({ summary: '查询占比统计' })
  @ApiBasicAuth()
  @Get('/getAllRatioChart')
  @Auth()
  async getAllRatioChart(@Query('type') type: 'access' | 'operation') {
    const data = await this.logService.getAllRatioChart(type);
    return Result.success(data, '查询占比统计');
  }

  @ApiOperation({ summary: '查询详情'})
  @ApiBasicAuth()
  @Get('/getDetail')
  @Auth()
  async getDetail(@Query('id') id: number) {
    const data = await this.logService.getDetail(id);
    return Result.success(data, '获取详情成功');
  }
}
