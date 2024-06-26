import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post} from '@nestjs/common';
import {MajorQuantityService} from './major-quantity.service';
import {CreateMajorQuantityDto} from './dto/create-major-quantity.dto';
import {UpdateMajorQuantityDto} from './dto/update-major-quantity.dto';
import {Result} from "../../common/result";
import {Auth} from "../../sys/auth/decorators/auth.decorators";
import {OpLog} from "../../common/decorators/recordLog.dectorator";

@Controller('major')
export class MajorQuantityController {
  constructor(private readonly majorQuantityService: MajorQuantityService) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('添加主要工程量')
  async create(@Body() createMajorQuantityDto: CreateMajorQuantityDto) {
    const data = await this.majorQuantityService.create(createMajorQuantityDto);
    return Result.success(data)
  }

  @Get()
  @Auth()
  async findAll() {
    const data = await this.majorQuantityService.findAll();
    return Result.success(data)
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    return Result.success(await this.majorQuantityService.findOne(+id))
  }

  @Patch(':id')
  @Auth()
  async update(@Param('id') id: number, @Body() updateMajorQuantityDto: UpdateMajorQuantityDto) {
    const data = await this.majorQuantityService.update(+id, updateMajorQuantityDto);
    return Result.success(data)
  }

  @Patch('/calculation/:id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('计算主要工程量')
  async calculation(@Param('id') id: number, @Body('listIds')listIds: number[], @Body('calculation') calculation: string ) {
    const data = await this.majorQuantityService.calculation(id, listIds, calculation);
    return Result.success(data)
  }

  @Delete(':id')
  @Auth()
  async remove(@Param('id') id: number) {
    const data = await this.majorQuantityService.remove(+id);
    return Result.success(data)
  }
}
