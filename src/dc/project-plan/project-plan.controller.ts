import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ProjectPlanService} from './project-plan.service';
import {Auth} from "../../sys/auth/decorators/auth.decorators";
import {Result} from "../../common/result";
import {AddGoalDto} from "./dto/add-goal.dto";
import {AddPlanDto} from "./dto/add-plan.dto";

@Controller('/project/plan')
export class ProjectPlanController {
  constructor(private readonly projectPlanService: ProjectPlanService) {}
  
  /**
   * 更新添加
   * @param overview
   */
  @Post('/add/overview')
  @Auth()
  async addOverView(@Body('overview') overview: string){
    const data = await this.projectPlanService.addOverView(overview)
    return Result.success(data)
  }
  
  @Get('/get/overview')
  @Auth()
  async getOverView() {
    const data = await this.projectPlanService.getOverView()
    return Result.success(data)
  }
  
  @Post('/add/goal')
  @Auth()
  async addGoal(@Body() addGoalDto: AddGoalDto) {
    const data = await this.projectPlanService.addGoal(addGoalDto)
    return Result.success(data)
  }
  
  @Get('/get/goal')
  @Auth()
  async getGoal(@Query('filed')filed: string){
    const data = await this.projectPlanService.getGoal(filed)
    return Result.success(data)
  }
  
  @Get('/get')
  @Auth()
  async get(){
    const data = await this.projectPlanService.get()
    return Result.success(data)
  }
  
  @Post('/add/plan')
  @Auth()
  async addPlan(@Body() addPlanDto:AddPlanDto){
    const data = await this.projectPlanService.addPlan(addPlanDto)
    return Result.success(data)
  }
}
