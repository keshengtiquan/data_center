import {Inject, Injectable} from '@nestjs/common';
import {PrismaService} from "../../prisma1/prisma.service";
import {ClsService} from "nestjs-cls";
import {User} from "@prisma/client";
import {AddGoalDto} from "./dto/add-goal.dto";
import {AddPlanDto} from "./dto/add-plan.dto";

@Injectable()
export class ProjectPlanService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  
  async addOverView(overview: string) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return await this.prisma.projectPlan.upsert({
      where: {
        id: tenantId
      },
      update: {
        overview,
        updateBy: userInfo.userName
      },
      create: {
        id: tenantId,
        tenantId: tenantId,
        overview,
        updateBy: userInfo.userName
      },
    })
  }
  
  async getOverView() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const res =await this.prisma.projectPlan.findUnique({
      where: {
        id: tenantId
      },
      select: {
        overview: true
      }
    })
    return res.overview
  }
  
  async addGoal(addGoalDto: AddGoalDto) {
    const {filed, value} = addGoalDto
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const userInfo = this.cls.get('headers').user as User;
   
    const update = {
      updateBy: userInfo.userName
    }
    const create = {
      tenantId: tenantId,
      id: tenantId,
      updateBy: userInfo.userName
    }
    if(filed === 'secure') {
      update['secure'] = value
      create['secure'] = value
    } else if(filed === 'quality') {
      update['quality'] = value
      create['quality'] = value
    } else if(filed === 'environmental'){
      update['environmental'] = value
      create['environmental'] = value
    }
    await this.prisma.projectPlan.upsert({
      where: {
        id: tenantId,
      },
      update: update,
      create: create,
    })
  }
  
  async getGoal(filed: string) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const res =await this.prisma.projectPlan.findUnique({
      where: {
        id: tenantId
      },
    })
    return res[filed]
  }
  
  async get() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return await this.prisma.projectPlan.findUnique({
      where: {
        id: tenantId
      }
    })
  }
  
  async addPlan(addPlanDto: AddPlanDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return await this.prisma.projectPlan.upsert({
      where: {
        id: tenantId
      },
      update: {
        contractStart: addPlanDto.contractStart,
        contractEnd: addPlanDto.contractEnd,
        planStart: addPlanDto.planStart,
        planEnd: addPlanDto.planEnd,
        updateBy: userInfo.userName
      },
      create: {
        id: tenantId,
        tenantId: tenantId,
        contractStart: addPlanDto.contractStart,
        contractEnd: addPlanDto.contractEnd,
        planStart: addPlanDto.planStart,
        planEnd: addPlanDto.planEnd,
        updateBy: userInfo.userName
      },
    })
  }
}
