import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { DictService } from './dict.service';
import { CreateDictDto } from './dto/create-dict.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { FindDictListDto } from './dto/dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';

@ApiTags('字典管理')
@Controller('dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @ApiOperation({ summary: '创建字典' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateDictDto })
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createDictDto: CreateDictDto) {
    const data = await this.dictService.create(createDictDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取树形字典' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'parentId', type: Number })
  @Get('/getTree')
  @Auth()
  async getTree() {
    const data = await this.dictService.getTree();
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取字典列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  async getlist(@Query() findDictListDto: FindDictListDto) {
    const data = await this.dictService.getlist(findDictListDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '查询字典' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async getOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.dictService.getOne(id);
    return Result.success(data);
  }

  @ApiOperation({ summary: '修改字典' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async update(@Body() updateDictDto: UpdateDictDto) {
    const data = await this.dictService.update(updateDictDto);
    return Result.success(data);
  }
}
