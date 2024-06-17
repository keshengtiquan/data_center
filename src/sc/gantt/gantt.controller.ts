import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors} from '@nestjs/common';
import {GanttService} from './gantt.service';
import {CreateGanttDto} from './dto/create-gantt.dto';
import {Auth} from 'src/sys/auth/decorators/auth.decorators';
import {Result} from 'src/common/result';
import {UtcToLocalInterceptor} from "../../common/interceptor/utc2Local.interceptor";
import {UpdateGanttDto} from "./dto/update-gantt.dto";
import {AddListDto, GetListDto} from "./dto/add-list.dto";

@Controller('gantt')
export class GanttController {
  constructor(private readonly ganttService: GanttService) {}

  /**
   * 创建甘特图任务
   * @param createGanttDto
   */
  @Post('/create')
  @Auth()
  async create(@Body() createGanttDto: CreateGanttDto) {
    return Result.success(await this.ganttService.create(createGanttDto));
  }
  
  @Post('/addList')
  @Auth()
  async addList(@Body() addListDto: AddListDto){
    return Result.success(await this.ganttService.addList(addListDto))
  }
  
  /**
   * 查询甘特图任务
   * @param type
   */
  @Get('/tree')
  @UseInterceptors(UtcToLocalInterceptor)
  @Auth()
  async tree(@Query('type') type: string) {
    return Result.success(await this.ganttService.tree(type))
  }
  
  /**
   * 根据Id查询任务
   * @param id
   */
  @Get('/get')
  @Auth()
  async get(@Query('id') id: number){
   
    return Result.success(await this.ganttService.get(id))
  }
  
  /**
   * 修改任务
   * @param id
   * @param updateGanttDto
   */
  @Patch(':id')
  @Auth()
  async update(@Param('id') id: number, @Body() updateGanttDto: UpdateGanttDto) {
    console.log(id, updateGanttDto)
    return Result.success(await this.ganttService.update(id, updateGanttDto))
  }
  
  /**
   * 删除任务
   * @param id
   */
  @Delete(':id')
  @Auth()
  async delete(@Param('id') id: number) {
    return Result.success(await this.ganttService.delete(id))
  }
  
  /**
   * 查询任务下的清单
   * @param id 任务ID
   */
  @Get('/list')
  @Auth()
  async getList(@Query() getListDto: GetListDto){
    return Result.success(await this.ganttService.getList(getListDto))
  }
  
  
}
