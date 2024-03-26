import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { GenerateService } from './generate.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { CreateGenBasicDto } from './dto/create-generate.dto';
import { BasiceFindListDto } from './dto/basice-find-list.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { DictTransform } from '../common/decorators/dict.dectorator';

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
}
