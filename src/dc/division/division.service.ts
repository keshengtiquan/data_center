import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { handleTree } from 'src/utils/tree';
import { FindDivisionListDto } from './dto/find-division-list.dto';
import { AddListDto } from './dto/add-list-dto';
import Decimal from 'decimal.js';

@Injectable()
export class DivisionService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建分部分项
   * @param createDivisionDto
   * @returns
   */
  async create(createDivisionDto: CreateDivisionDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    const findDivison = await this.prisma.division.findFirst({
      where: {
        divisionName: createDivisionDto.divisionName,
        tenantId: tenantId,
        deleteflag: 0,
      },
    });
    if (findDivison) {
      throw new BadRequestException('该分部分项已存在');
    }
    //先获取所有父节点的ID
    const divisions = await this.prisma.division.findMany({
      where: { tenantId: tenantId },
    });
    const divisionTree = handleTree(divisions);
    const parentNames = this.getParentNamesById(divisionTree, createDivisionDto.parentId);

    return this.prisma.$transaction(async (prisma) => {
      const divisionRes = await prisma.division.create({
        data: {
          divisionCode: createDivisionDto.divisionCode,
          divisionName: createDivisionDto.divisionName,
          divisionType: createDivisionDto.divisionType,
          parentId: createDivisionDto.parentId,
          tenantId: tenantId,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
      parentNames.push(divisionRes.id);
      await prisma.division.update({
        where: { id: divisionRes.id },
        data: {
          parentNames: JSON.stringify(parentNames),
        },
      });
      return divisionRes;
    });
  }

  /**
   * 获取树形结构的上级id
   * @param treeData 树形结构数组
   * @param parentId 当前节点的父级ID
   * @param parentIds 上级ID数据，调用时可省略
   */
  getParentNamesById(treeData: any[], parentId: number, parentIds = []) {
    for (const node of treeData) {
      if (node.id === parentId) {
        return [...parentIds, node.id];
      }
      if (node.children && node.children.length > 0) {
        const found = this.getParentNamesById(node.children, parentId, [...parentIds, node.id]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  }

  /**
   * 查询分部分项列表
   * @param FindDivisionListDto
   * @returns
   */
  async findAll(findDivisionListDto: FindDivisionListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { divisionType } = findDivisionListDto;
    const condition = {
      deleteflag: 0,
      tenantId: tenantId,
      ...(divisionType && { divisionType: divisionType }),
    };
    const list = await this.prisma.division.findMany({
      where: condition,
      include: {
        lists: {
          where: {
            deleteflag: 0,
          },
        },
      },
    });

    list.forEach((division) => {
      if (division.lists && division.lists.length > 0) {
        // division.lists.forEach((listItem) => {
        //   // 计算乘积并添加到对象中
        //   division['outputValue'] = Number(Decimal.mul(listItem.quantities, listItem.unitPrice));

        // });
        division['outputValue'] = division.lists.reduce((acc, cur) => {
          return acc + Number(Decimal.mul(cur.quantities, cur.unitPrice));
        }, 0);
      }else {
        division['outputValue'] = 0
      }
    });

    // 查询某种类型的列表
    if (divisionType) {
      return list;
    }
    const newTree = handleTree(list);
    return this.addTreeLeaf(newTree);
  }

  /**
   * 根据ID查询分部分项
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.division.findUnique({
      where: { id },
    });
  }

  /**
   * 更新分部分项
   * @param id
   * @returns
   */
  async update(updateDivisionDto: UpdateDivisionDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.division.update({
      where: { id: updateDivisionDto.id },
      data: {
        divisionCode: updateDivisionDto.divisionCode,
        divisionName: updateDivisionDto.divisionName,
        divisionType: updateDivisionDto.divisionType,
        parentId: updateDivisionDto.parentId,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除分部分项
   * @param id
   * @returns
   */
  async remove(id: number) {
    const find = await this.prisma.division.findFirst({
      where: {
        parentId: id,
      },
    });
    if (find) {
      throw new BadRequestException('请先删除子级数据');
    }

    this.prisma.$transaction(async (prisma) => {
      const list = await prisma.division.update({
        where: { id },
        include: {
          lists: {
            where: {
              deleteflag: 0,
            },
          },
        },
        data: { deleteflag: 1 },
      });
      const ids = list.lists.map((item) => item.id);
      await prisma.list.updateMany({
        where: { id: { in: ids } },
        data: { currentSection: null, sectionalEntry: null },
      });
      return list;
    });
  }

  /**
   * 添加isTreeLeaf字段
   * @param data
   */
  addTreeLeaf(data: any[]) {
    return data.map((item) => {
      const obj = { ...item, isTreeLeaf: true };
      if (item.children && item.children.length > 0) {
        obj.children = this.addTreeLeaf(item.children);
      } else {
        obj.isTreeLeaf = false;
      }
      return obj;
    });
  }

  /**
   * 分部分项添加清单
   * @param addListDto
   */
  async addList(addListDto: AddListDto) {
    return await this.prisma.list.updateMany({
      where: { id: { in: addListDto.listIds } },
      data: {
        sectionalEntry: JSON.stringify(addListDto.parentNames),
        currentSection: addListDto.parentNames[addListDto.parentNames.length - 1],
      },
    });
  }

  /**
   * 删除分部分项清单
   * @param id
   */
  async deleteDivisionList(id: number) {
    return await this.prisma.list.update({
      where: { id },
      data: {
        currentSection: null,
        sectionalEntry: null,
      },
    });
  }

  /**
   * 批量删除分部分项清单
   * @param ids
   */
  async batchDeleteDivisionList(ids: number[]) {
    return await this.prisma.list.updateMany({
      where: { id: { in: ids } },
      data: {
        currentSection: null,
        sectionalEntry: null,
      },
    });
  }
}
