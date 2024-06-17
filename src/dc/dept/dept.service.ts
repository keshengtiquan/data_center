import {Inject, Injectable} from '@nestjs/common';
import {CreateDeptDto} from './dto/create-dept.dto';
import {UpdateDeptDto} from './dto/update-dept.dto';
import {User} from '@prisma/client';
import {PrismaService} from 'src/prisma1/prisma.service';
import {ClsService} from 'nestjs-cls';
import {handleTree} from 'src/utils/tree';

@Injectable()
export class DeptService {

  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建部门
   * @param createDeptDto
   * @returns
   */
  async create(createDeptDto: CreateDeptDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const list = await this.prisma.dept.create({
      data: {
        leaderId: createDeptDto.leaderId,
        tenantId,
        deptName: createDeptDto.deptName,
        deptType: createDeptDto.deptType,
        parentId: createDeptDto.parentId,
        sortNumber: createDeptDto.sortNumber,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      },
    });
    return list;
  }

  /**
   * 查询部门列表
   * @param FindDeptListDto
   * @returns
   */
  async findAll() {
    const tenantId = +this.cls?.get('headers').headers['x-tenant-id'];
    const condition = {
      deleteflag: 0,
      tenantId,
    };
    const list = await this.prisma.dept.findMany({
      where: condition,
      orderBy: {
        sortNumber: 'asc'
      }
    });

    // 转换leaderId
    const leaderIdSet = new Set<number>();
    list.forEach((item) => {
      if (item.leaderId) leaderIdSet.add(item.leaderId);
    });
    const userList = await this.prisma.user.findMany({
      where: {
        id: { in: Array.from(leaderIdSet) },
        deleteflag: 0,
      },
    });
    const deptList = list.map(item => {
      const leader = userList.find(user => user.id === item.leaderId);
      return {
        ...item,
        leaderName: leader?.nickName,
      }
    })
    

    return handleTree(deptList);
  }

  /**
   * 根据ID查询部门
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.dept.findUnique({
      where: { id },
    });
  }

  /**
   * 更新部门
   * @param id
   * @returns
   */
  async update(updateDeptDto: UpdateDeptDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.dept.update({
      where: { id: updateDeptDto.id },
      data: {
        leaderId: updateDeptDto.leaderId,
        deptName: updateDeptDto.deptName,
        deptType: updateDeptDto.deptType,
        parentId: updateDeptDto.parentId,
        sortNumber: updateDeptDto.sortNumber,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除部门
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.dept.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除部门
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.dept.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 查询所有作业队
   */
  async findAllTeam() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    return this.prisma.dept.findMany({
      where: {
        tenantId,
        deleteflag: 0,
        deptType: 'operation_team'
      }
    })
  }
  
  async getOrgData() {
    const tree = await this.findAll()
    const obj = this.coverData(tree)
    
    return obj[0]
  }
  
  coverData(data: any[])  {
    const orgData = data.map(item => {
      const obj: any = {
        id: item.id,
        pid: item.parentId,
        label: item.deptName,
        noDragging: true,
        leaderName: item.leaderName,
        style: {"color":"#fff","background":"#108ffe"},
      }
      if (item.children && item.children.length > 0) {
        obj['children'] = this.coverData(item.children)
      }
      return obj
    })
    return orgData
  }
}
