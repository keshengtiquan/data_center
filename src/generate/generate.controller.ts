import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { GenerateService } from './generate.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { CreateGenBasicDto } from './dto/create-generate.dto';
import { BasiceFindListDto } from './dto/basice-find-list.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { DictTransform } from '../common/decorators/dict.dectorator';
import * as fs from 'fs';
import * as path from 'path';
import { GenConfig } from '@prisma/client';
import { Response } from 'express';

@ApiTags('代码生成')
@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @ApiOperation({ summary: '获取数据库表' })
  @ApiBearerAuth()
  @Get('/getTables')
  @Auth()
  async tables() {
    const data = await this.generateService.getTables();
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取数据库表字段' })
  @ApiBearerAuth()
  @Get('/getTableColumn')
  @Auth()
  async tableColumns(@Query('tableName') tableName: string) {
    const data = await this.generateService.getTableColumns(tableName);
    return Result.success(data);
  }

  @ApiOperation({ summary: '创建修改基础信息' })
  @ApiBearerAuth()
  @Post('/editBasice')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async editBasice(@Body() createGenBasicDto: CreateGenBasicDto) {
    const data = await this.generateService.editBasice(createGenBasicDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取基础信息列表' })
  @ApiBearerAuth()
  @Get('/getBasicList')
  @Auth()
  @DictTransform([{ dictType: 'output_type', field: 'generateType' }])
  async getBasicList(@Query() basiceFindListDto: BasiceFindListDto) {
    const data = await this.generateService.getBasicList(basiceFindListDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取基础信息' })
  @ApiBearerAuth()
  @Get('/getBasic')
  @Auth()
  async getBasic(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.generateService.getBasic(id);
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取列表' })
  @ApiBearerAuth()
  @Get('/getConfigList')
  @Auth()
  async getConfigList(@Query('basicId') basicId: number) {
    const data = await this.generateService.getConfigList(basicId);
    return Result.success(data);
  }

  @ApiOperation({ summary: '保存配置' })
  @ApiBearerAuth()
  @Post('/saveConfig')
  @Auth()
  async saveConfig(@Body() tableData: GenConfig[]) {
    const data = await this.generateService.saveConfig(tableData);
    return Result.success(data);
  }

  @ApiOperation({ summary: '生成代码' })
  @ApiBearerAuth()
  @Get('/generateCode')
  // @Auth()
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async generateTem(@Query('id') id: number, @Res() res: Response) {
    const filename = await this.generateService.generateTem(id);
    const filePath = path.join(process.cwd(), filename);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '预览代码' })
  @ApiBearerAuth()
  @Get('/previewCode')
  @Auth()
  async previewCode(@Query('id') id: number) {
    const data = await this.generateService.previewCode(id);
    return Result.success(data);
  }
}
