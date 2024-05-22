import { Inject, Injectable } from '@nestjs/common';
import { CreateCompanyDeptDto } from './dto/create-company-dept.dto';
import { PrismaService } from 'src/prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { handleTree } from 'src/utils/tree';
import { FindTreeNodeDto } from './dto/company-dept.dto';
import { UpdateCompanyDeptDto } from './dto/update-company-dept.dto';

@Injectable()
export class CompanyDeptService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async create(createCompanyDeptDto: CreateCompanyDeptDto) {
    return await this.prisma.companyDept.create({
      data: {
        parentId: createCompanyDeptDto.parentId,
        deptName: createCompanyDeptDto.deptName,
        leaderId: createCompanyDeptDto.leaderId,
        deptType: createCompanyDeptDto.deptType,
        sortNumber: createCompanyDeptDto.sortNumber,
      },
    });
  }

  /**
   * 获取组织列表
   */
  async getlist() {
    const list = await this.prisma.companyDept.findMany({
      where: {
        deleteflag: 0,
      },
      orderBy: {
        sortNumber: 'asc',
      },
    });
    return handleTree(list);
  }

  /**
   * 获取父级节点下的部门
   * @param parentId
   */
  async getTreeNode(findTreeNodeDto: FindTreeNodeDto) {
    const { parentId, current, pageSize, deptName } = findTreeNodeDto;
    const condition = {
      ...(parentId && { parentId: parentId }),
      ...(deptName && { deptName: { contains: deptName } }),
      deleteflag: 0,
    };
    const list = await this.prisma.companyDept.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: { sortNumber: 'asc' },
    });
    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.companyDept.count({ where: condition }),
    };
  }

  /**
   * 删除组织机构
   * @param id
   */
  async deleteCompanyDept(id: number) {
    return await this.prisma.companyDept.update({
      where: { id },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 批量删除
   * @param ids
   */
  async batchDelete(ids: number[]) {
    await this.prisma.companyDept.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 根据ID获取组织机构信息
   * @param id
   */
  async getDeptById(id: number) {
    return await this.prisma.companyDept.findUnique({
      where: { id },
    });
  }

  /**
   * 更新组织机构
   * @param updateCompanyDeptDto
   */
  async updateCompanyDept(updateCompanyDeptDto: UpdateCompanyDeptDto) {
    await this.prisma.companyDept.update({
      where: { id: updateCompanyDeptDto.id },
      data: {
        deptName: updateCompanyDeptDto.deptName,
        parentId: updateCompanyDeptDto.parentId,
        deptType: updateCompanyDeptDto.deptType,
        sortNumber: updateCompanyDeptDto.sortNumber,
        leaderId: updateCompanyDeptDto.leaderId,
      },
    });
  }

  /**
   * 根据机构名称查询机构ID
   * @returns {id: number, deptName: string}
   */
  async getCompanyDeptId(deptName: string[]) {
    const list = await this.prisma.companyDept.findMany({
      where: {
        deptName: { in: deptName },
        deleteflag: 0,
      },
      select: {
        id: true,
        deptName: true,
      }
    });
    return list
  }
}
