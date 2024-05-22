import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Header,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { WorkPlaceService } from './workPlace.service';
import { CreateWorkPlaceDto } from './dto/create-workPlace.dto';
import { UpdateWorkPlaceDto } from './dto/update-workPlace.dto';
import { FindWorkPlaceListDto } from './dto/find-workPlace-list.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { Result } from 'src/common/result';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { DictTransform } from 'src/common/decorators/dict.dectorator';
import { FindWorkPlaceListListDto } from './dto/find-workPlaceList-list.dto';
import { SaveWorkPlaceListQuantities } from './dto/save-workPlace-quantity.dto';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import { FindWorkPlaceListCollectionDto } from './dto/find-workplace-list-collection.dto';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';
import { UpdateWorkPlacePositionDto } from './dto/update-workplace-positon.dto';
import { ExportWorkPlaceListDto } from './dto/export-workPlace-list.dto';

@ApiTags('工点管理')
@Controller('workPlace')
export class WorkPlaceController {
  constructor(private readonly workPlaceService: WorkPlaceService) {}

  @ApiOperation({ summary: '创建工点' })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建工点')
  async create(@Body() createWorkPlaceDto: CreateWorkPlaceDto) {
    const data = await this.workPlaceService.create(createWorkPlaceDto);
    return Result.success(data, '创建工点成功');
  }

  @ApiOperation({ summary: '查询工点列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  @DictTransform([{ dictType: 'WorkPlaceType', field: 'workPlaceType' }])
  async findAll(@Query() findWorkPlaceListDto: FindWorkPlaceListDto) {
    const data = await this.workPlaceService.findAll(findWorkPlaceListDto);
    return Result.success(data, '查询工点列表成功');
  }

  @ApiOperation({ summary: '查询工点列表无分页' })
  @ApiBearerAuth()
  @Get('/getlist/paginationFree')
  @Auth()
  async findAllPaginationFree(@Query() findWorkPlaceListDto: FindWorkPlaceListDto) {
    const data = await this.workPlaceService.findAllPaginationFree(findWorkPlaceListDto);
    return Result.success(data, '查询工点列表成功');
  }

  @ApiOperation({ summary: '根据ID查询工点' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.workPlaceService.findOne(id);
    return Result.success(data, '查询工点成功');
  }

  @ApiOperation({ summary: '更新工点' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新工点')
  async update(@Body() updateWorkPlaceDto: UpdateWorkPlaceDto) {
    const data = await this.workPlaceService.update(updateWorkPlaceDto);
    return Result.success(data, '更新工点成功');
  }

  @ApiOperation({ summary: '删除工点' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除工点')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.workPlaceService.remove(id);
    return Result.success(data, '删除工点成功');
  }

  @ApiOperation({ summary: '批量删除工点' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除工点')
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.workPlaceService.batchDelete(ids);
    return Result.success(data, '删除工点成功');
  }

  @ApiOperation({ summary: '关联工点清单' })
  @ApiBearerAuth()
  @Post('/relationList')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('关联工点清单')
  async relationList(
    @Body('workPlaceId', generateParseIntPipe('workPlaceId')) workPlaceId: number,
    @Body('listIds') listIds: number[],
  ) {
    const data = await this.workPlaceService.relationList(workPlaceId, listIds);
    return Result.success(data, '工点关联清单成功');
  }

  @ApiOperation({ summary: '查询工点下的清单' })
  @ApiBearerAuth()
  @Get('/workPlaceList')
  @Auth()
  async workPlaceList(@Query() findWorkPlaceListListDto: FindWorkPlaceListListDto) {
    const data = await this.workPlaceService.workPlaceList(findWorkPlaceListListDto);
    return Result.success(data, '查询工点下的清单成功');
  }

  @ApiOperation({ summary: '删除工点下的清单' })
  @ApiBearerAuth()
  @Post('/deleteWorkPlaceList')
  @Auth()
  @OpLog('删除工点下的清单')
  async deleteWorkPlaceList(@Body('id') id: number) {
    const data = await this.workPlaceService.deleteWorkPlaceList(id);
    return Result.success(data, '删除成功');
  }

  @ApiOperation({ summary: '批量删除工点下的清单' })
  @ApiBearerAuth()
  @Post('/batchDeleteWorkPlaceList')
  @Auth()
  @OpLog('批量删除工点下的清单')
  async batchDeleteWorkPlaceList(@Body('ids') ids: number[]) {
    const data = await this.workPlaceService.batchDeleteWorkPlaceList(ids);
    return Result.success(data, '删除成功');
  }

  @ApiOperation({ summary: '保存分配工程量' })
  @ApiBearerAuth()
  @Post('/saveWorkPlaceListQuantities')
  @Auth()
  @OpLog('保存分配工程量')
  async saveWorkPlaceListQuantities(@Body() saveWorkPlaceListQuantities: SaveWorkPlaceListQuantities) {
    const data = await this.workPlaceService.saveWorkPlaceListQuantities(saveWorkPlaceListQuantities);
    return Result.success(data, '保存成功');
  }

  @ApiOperation({ summary: '查询工点清单汇总' })
  @ApiBearerAuth()
  @Get('/workplace/collection')
  @Auth()
  async findWorkPlaceListCollection(@Query() findWorkPlaceListCollectionDto: FindWorkPlaceListCollectionDto) {
    const data = await this.workPlaceService.findWorkPlaceListCollection(findWorkPlaceListCollectionDto);
    return Result.success(data, '查询成功');
  }

  @ApiOperation({ summary: '工点导入模版' })
  @ApiBearerAuth()
  @Post('/import/template')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async importTemplate(@Res() res: Response) {
    const fileName = await this.workPlaceService.exportWorkPlaceTemplate();

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    fileStream.on('error', (error) => {
      return Result.error(error.message);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '工点导入' })
  @ApiBearerAuth()
  @Post('/import')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    const data = await this.workPlaceService.importWorkPlace(file);
    return Result.success(data, '导入成功');
  }

  @ApiOperation({ summary: '修改工点位置' })
  @Post('/update/position')
  @ApiBearerAuth()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('修改工点位置')
  async updatePosition(@Body() updateWorkPlacePositionDto: UpdateWorkPlacePositionDto[]) {
    const data = await this.workPlaceService.updatePosition(updateWorkPlacePositionDto);
    return Result.success(data, '修改成功');
  }

  @ApiOperation({ summary: '工点清单导入模版' })
  @ApiBearerAuth()
  @Post('/import/workplacelist/template')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async importWorkPlaceListTemplate(@Res() res: Response) {
    const fileName = await this.workPlaceService.exportWorkPlaceListTemplate();
    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    fileStream.on('error', (error) => {
      return Result.error(error.message);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '工点清单导入' })
  @ApiBearerAuth()
  @Post('/import/workplacelist')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importWorkPlaceList(
    @Body('workPlaceId') workPlaceId: number,
    @UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File,
  ) {
    const res = await this.workPlaceService.importWorkPlaceList(file, +workPlaceId);
    return Result.success(res, '导入成功');
  }

  @ApiOperation({ summary: '工点清单汇总导出' })
  @ApiBearerAuth()
  @Post('/export/workplacelist/collection')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async exportWorkPlaceListCollection(
    @Body() exportWorkPlaceListDto: ExportWorkPlaceListDto,
    number,
    @Res() res: Response,
  ) {
    const fileName = await this.workPlaceService.exportWorkPlaceListCollection(exportWorkPlaceListDto);

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    fileStream.on('error', (error) => {
      return Result.error(error.message);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '工点清单汇总导入' })
  @ApiBearerAuth()
  @Post('/import/workplacelist/collection')
  @Auth() 
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importWorkPlaceListCollection(@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    const res = await this.workPlaceService.importWorkPlaceListCollection(file);
    return Result.success(res, '导入成功');
  }
}
