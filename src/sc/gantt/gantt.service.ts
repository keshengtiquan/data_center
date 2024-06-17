import {Inject, Injectable} from '@nestjs/common';
import {CreateGanttDto} from './dto/create-gantt.dto';
import {PrismaService} from 'src/prisma1/prisma.service';
import {ClsService} from 'nestjs-cls';
import {handleTree} from "../../utils/tree";
import * as dayjs from 'dayjs';
import {UpdateGanttDto} from "./dto/update-gantt.dto";
import {AddListDto, GetListDto} from "./dto/add-list.dto";

@Injectable()
export class GanttService {
  
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  
  /**
   * 创建任务
   * @param createGanttDto
   */
  async create(createGanttDto: CreateGanttDto) {
    const user = this.cls.get('headers').user
    this.prisma.$transaction(async (prisma) => {
      const res = await prisma.gantt.create({
        data: {
          ...createGanttDto,
          tenantId: user.defaultProjectId,
          updateBy: user.userName,
          createBy: user.userName
        }
      })
      const tree = await prisma.gantt.findMany({
        where: {
          tenantId: user.defaultProjectId,
          deleteflag: 0
        }
      })
      const newTree = handleTree(tree, 'id', 'parent');
      await this.updateDate(newTree);
      return res
    })
    
  }
  
  /**
   * 查询树形列表
   * @param type
   */
  async tree(type: string) {
    const user = this.cls.get('headers').user
    
    const condition: Record<string, any> = {
      ...(type && {type: type}),
      deleteflag: 0,
      tenantId: user.defaultProjectId
    };
    const list = await this.prisma.gantt.findMany({
      where: condition
    })
    return handleTree(list, 'id', 'parent')
  }
  
  /**
   * 更新任务的树形时间
   * @param data
   */
  async updateDate(data: any) {
    if (!data || data.length === 0) {
      return;
    }
    
    for (const item of data) {
      if (item.children && item.children.length > 0) {
        await this.updateDate(item.children);
        
        const childEndDates = item.children.map((child) => dayjs(child.endDate));
        const childStartDates = item.children.map((child) => dayjs(child.startDate));
        
        const maxChildEndDate = new Date(Math.max.apply(null, childEndDates));
        const minChildStartDate = new Date(Math.min.apply(null, childStartDates));
        
        item.startDate = dayjs(minChildStartDate).format('YYYY-MM-DD');
        item.endDate = dayjs(maxChildEndDate).format('YYYY-MM-DD');
        
        item.duration = dayjs(maxChildEndDate).diff(dayjs(minChildStartDate), 'day') + 1;
        await this.prisma.gantt.update({
          where: {
            id: item.id
          },
          data: {
            startDate: item.startDate,
            endDate: item.endDate,
            duration: item.duration,
          }
        })
      }
    }
  }
  
  /**
   * 查询数据
   * @param id
   */
  async get(id: number) {
    const user = this.cls.get('headers').user
    return await this.prisma.gantt.findUnique({
      where: {
        id,
        deleteflag: 0,
        tenantId: user.defaultProjectId
      }
    })
  }
  
  /**
   * 修改方法
   * @param id
   * @param updateGanttDto
   */
  async update(id: number, updateGanttDto: UpdateGanttDto) {
    const user = this.cls.get('headers').user
    this.prisma.$transaction(async (prisma) => {
      const oldGantt = await this.prisma.gantt.findUnique({
        where: {
          id
        }
      })
      const res = await prisma.gantt.update({
        where: {id},
        data: {...updateGanttDto}
      })
      console.log(res)
      console.log(updateGanttDto)
      if (oldGantt.startDate === updateGanttDto.startDate && oldGantt.endDate === updateGanttDto.endDate) {
        return res
      }
      const tree = await prisma.gantt.findMany({
        where: {
          tenantId: user.defaultProjectId,
          deleteflag: 0
        }
      })
      const newTree = handleTree(tree, 'id', 'parent');
      await this.updateDate(newTree);
      
      return res
    })
  }
  
  /**
   * 删除方法
   * @param id
   */
  async delete(id: number) {
    return await this.prisma.gantt.update({
      where: {id},
      data: {
        deleteflag: 1
      }
    })
  }
  
  /**
   * 添加清单
   * @param addListDto
   */
  async addList(addListDto: AddListDto) {
    const user = this.cls.get('headers').user
    const {listIds, id} = addListDto
    const task = await this.prisma.gantt.findUnique({
      where: {
        id
      }
    })
    const lists = await this.prisma.list.findMany({
      where: {
        id: {
          in: listIds
        }
      }
    })
    
    const saveData = []
    listIds.forEach(item => {
      const list = lists.find(list => list.id === item)
      saveData.push({
        tenantId: user.defaultProjectId,
        text: list.listName + '【' + list.listCode + '】',
        startDate: task.startDate,
        listId: list.id,
        duration: task.duration,
        endDate: task.endDate,
        progress: task.progress,
        parent: id,
        type: 'list',
        updateBy: user.userName,
        createBy: user.userName
      })
    })
    await this.prisma.gantt.createMany({
      data: saveData
    })
    const tree = await this.prisma.gantt.findMany({
      where: {
        tenantId: user.defaultProjectId,
        deleteflag: 0
      }
    })
    const newTree = handleTree(tree, 'id', 'parent');
    await this.updateDate(newTree);
  }
  
  /**
   * 查询清单列表
   * @param id
   */
  async getList(getListDto: GetListDto) {
    const {id, current, pageSize} = getListDto
    const user = this.cls.get('headers').user
    const ganttList = await this.prisma.gantt.findMany({
      where: {
        parent: id,
        deleteflag: 0,
        tenantId: user.defaultProjectId
      },
      select: {
        listId: true
      }
    })
    const listIds = ganttList.map(item => item.listId)
    console.log(listIds)
    const list = await this.prisma.list.findMany({
      where: {
        id: {
          notIn: listIds
        },
        deleteflag: 0,
        tenantId: user.defaultProjectId
      },
      skip: (current - 1) * pageSize,
      take: pageSize
    })
    
    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.list.count({
        where: {
          id: {
            notIn: listIds
          },
          deleteflag: 0,
          tenantId: user.defaultProjectId
        }
      })
    }
  }
}
