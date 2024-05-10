import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseInterceptors, Header, Res, UploadedFile } from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { Result } from 'src/common/result';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { DictTransform } from 'src/common/decorators/dict.dectorator';
import { FindDivisionListDto } from './dto/find-division-list.dto';
import { AddListDto } from './dto/add-list-dto';
import { OutputValueInterceptor } from 'src/common/interceptor/outputValue.interceptor';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';

@ApiTags('分部分项管理')
@Controller('division')
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @ApiOperation({ summary: '创建分部分项' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建分部分项')
  async create(@Body() createDivisionDto: CreateDivisionDto) {
    const data = await this.divisionService.create(createDivisionDto);
    return Result.success(data, '创建分部分项成功');
  }

  @ApiOperation({ summary: '查询分部分项列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  @DictTransform([{ dictType: 'division_type', field: 'divisionType' }])
  @UseInterceptors(UtcToLocalInterceptor, OutputValueInterceptor)
  async findAll(@Query() findDivisionListDto: FindDivisionListDto) {
    const data = await this.divisionService.findAll(findDivisionListDto);
    return Result.success(data, '查询分部分项列表成功');
  }

  @ApiOperation({ summary: '根据ID查询分部分项' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.divisionService.findOne(id);
    return Result.success(data, '查询分部分项成功');
  }

  @ApiOperation({ summary: '更新分部分项' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新分部分项')
  async update(@Body() updateDivisionDto: UpdateDivisionDto) {
    const data = await this.divisionService.update(updateDivisionDto);
    return Result.success(data, '更新分部分项成功');
  }

  @ApiOperation({ summary: '删除分部分项' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除分部分项')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.divisionService.remove(id);
    return Result.success(data, '删除分部分项成功');
  }

  @ApiOperation({ summary: '分部分项添加清单' })
  @ApiBearerAuth()
  @Post('/addlist')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('分部分项添加清单')
  async addList(@Body() addListDto: AddListDto) {
    const data = await this.divisionService.addList(addListDto);
    return Result.success(data, '添加清单成功');
  }

  @ApiOperation({ summary: '分部分项删除清单' })
  @ApiBearerAuth()
  @Post('/delete/divisionList')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('分部分项删除清单')
  async deleteDivisionList(@Body('id', generateParseIntPipe('id')) id: number){
    const data = await this.divisionService.deleteDivisionList(id);
    return Result.success(data, '删除清单成功');
  }

  @ApiOperation({ summary: '批量删除分部分项清单' })
  @ApiBearerAuth()
  @Post('/batchDelete/divisionList')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除分部分项清单')
  async batchDeleteDivisionList(@Body('ids') ids: number[]){
    const data = await this.divisionService.batchDeleteDivisionList(ids);
    return Result.success(data, '删除清单成功');
  }

  @ApiOperation({ summary: '导出模版' })
  @ApiBearerAuth()
  @Auth()
  @Post('/export/template')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async exportUserTemplate(@Res() res: Response) {
    const fileName = await this.divisionService.exportDivisionTemplate();

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '导入分部分项' })
  @ApiBearerAuth()
  @Post('/import')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('导入分部分项')
  @UseInterceptors(FileInterceptor('file'))
  async importDivision(@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    const data = await this.divisionService.importDivision(file);
    return Result.success(data, '导入分部分项成功');
  }
}
