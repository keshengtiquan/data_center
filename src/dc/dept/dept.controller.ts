import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { DeptService } from './dept.service';
import { CreateDeptDto } from './dto/create-dept.dto';
import { UpdateDeptDto } from './dto/update-dept.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { Result } from 'src/common/result';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { DictTransform } from 'src/common/decorators/dict.dectorator';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';

@ApiTags('部门管理')
@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({ summary: '创建部门' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog("创建部门")
  async create(@Body() createDeptDto: CreateDeptDto) {
    const data = await this.deptService.create(createDeptDto);
    return Result.success(data, '创建部门成功');
  }

  @ApiOperation({ summary: '查询部门列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  @DictTransform([{dictType: 'DeptType', field: 'deptType'}])
  async findAll() {
    const data = await this.deptService.findAll();
    return Result.success(data, '查询部门列表成功');
  }

  @ApiOperation({ summary: '查询作业队' })
  @ApiBearerAuth()
  @Get('/getlist/team')
  @Auth()
  async findAllTeam() {
    const data = await this.deptService.findAllTeam();
    return Result.success(data, '查询作业队成功');
  }

  @ApiOperation({ summary: '根据ID查询部门' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.deptService.findOne(id);
    return Result.success(data, '查询部门成功');
  }

  @ApiOperation({ summary: '更新部门' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog("更新部门")
  async update(@Body() updateDeptDto: UpdateDeptDto) {
    const data = await this.deptService.update(updateDeptDto);
    return Result.success(data, '更新部门成功');
  }

  @ApiOperation({ summary: '删除部门' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog("删除部门")
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.deptService.remove(id);
    return Result.success(data, '删除部门成功');
  }

  @ApiOperation({ summary: '批量删除部门' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.deptService.batchDelete(ids);
    return Result.success(data, '删除部门成功');
  }
}