import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { FindSectorListDto } from './dto/find-sector-list.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { Result } from 'src/common/result';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { FindSectorListListDto } from './dto/find-sector-list-list.dto';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';

@ApiTags('区段划分管理')
@Controller('sector')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @ApiOperation({ summary: '创建区段划分' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建区段')
  async create(@Body() createSectorDto: CreateSectorDto) {
    const data = await this.sectorService.create(createSectorDto);
    return Result.success(data, '创建区段划分成功');
  }

  @ApiOperation({ summary: '查询区段划分列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  async findAll(@Query() findSectorListDto: FindSectorListDto) {
    const data = await this.sectorService.findAll(findSectorListDto);
    return Result.success(data, '查询区段划分列表成功');
  }

  @ApiOperation({ summary: '根据ID查询区段划分' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.sectorService.findOne(id);
    return Result.success(data, '查询区段划分成功');
  }

  @ApiOperation({ summary: '更新区段划分' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新区段')
  async update(@Body() updateSectorDto: UpdateSectorDto) {
    const data = await this.sectorService.update(updateSectorDto);
    return Result.success(data, '更新区段划分成功');
  }

  @ApiOperation({ summary: '删除区段划分' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除区段')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.sectorService.remove(id);
    return Result.success(data, '删除区段划分成功');
  }

  @ApiOperation({ summary: '批量删除区段划分' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除区段')
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.sectorService.batchDelete(ids);
    return Result.success(data, '删除区段划分成功');
  }

  @ApiOperation({ summary: '查询区段下的清单'})
  @ApiBearerAuth()
  @Get('/sector/list')
  @Auth()
  async getSectorList(@Query() findSectorList: FindSectorListListDto){
    const data = await this.sectorService.getSectorList(findSectorList);
    return Result.success(data);
  }

  @ApiOperation({ summary: '区段划分图'})
  @ApiBearerAuth()
  @Get('/sector/chart')
  @Auth()
  async getSectorChart(){
    const data = await this.sectorService.getSectorChart();
    return Result.success(data);
  }
}
