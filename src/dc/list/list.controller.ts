import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Header, Res } from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { FindListListDto } from './dto/find-list-list.dto';
import { Result } from 'src/common/result';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ExportListDto } from './dto/export-list.dto';

@ApiTags('清单管理')
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @ApiOperation({ summary: '创建清单' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建清单')
  async create(@Body() createListDto: CreateListDto) {
    const data = await this.listService.create(createListDto);
    return Result.success(data, '创建清单成功');
  }

  @ApiOperation({ summary: '查询清单列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  async findAll(@Query() findListListDto: FindListListDto) {
    const data = await this.listService.findAll(findListListDto);
    return Result.success(data, '查询清单列表成功');
  }

  @ApiOperation({ summary: '根据ID查询清单' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.listService.findOne(id);
    return Result.success(data, '查询清单成功');
  }

  @ApiOperation({ summary: '更新清单' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新清单')
  async update(@Body() updateListDto: UpdateListDto) {
    const data = await this.listService.update(updateListDto);
    return Result.success(data, '更新清单成功');
  }

  @ApiOperation({ summary: '删除清单' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除清单')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.listService.remove(id);
    return Result.success(data, '删除清单成功');
  }

  @ApiOperation({ summary: '批量删除清单' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除清单')
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.listService.batchDelete(ids);
    return Result.success(data, '删除清单成功');
  }

  @ApiOperation({ summary: '导入清单模版' })
  @ApiBearerAuth()
  @Auth()
  @Post('/import/template')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async importTemplate(@Res() res: Response) {
    const fileName = await this.listService.exportListTemplate();

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '导入清单' })
  @ApiBearerAuth()
  @Auth()
  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importListFile(@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    const data = await this.listService.importListFile(file);
    return Result.success(data, '导入清单成功');
  }

  @ApiOperation({ summary: '导出清单' })
  @ApiBearerAuth()
  @Auth()
  @Post('/export')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async exportListFile(@Body()exportListDto: ExportListDto,@Res() res: Response) {
    const fileName = await this.listService.exportList(exportListDto);

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('end', () => {
      fs.unlinkSync(filePath);
    });
    return fileStream.pipe(res);
  }
}
