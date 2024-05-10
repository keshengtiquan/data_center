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
import { ExcelService } from 'src/excel/excel.service';

@Injectable()
export class DivisionService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(ExcelService)
  private readonly excelService: ExcelService;

  private excelTableHeaders = [
    { col: 'A', width: 20, key: 'unitProject', header: '单位工程' },
    { col: 'B', width: 20, key: 'subunitProject', header: '子单位工程' },
    { col: 'C', width: 20, key: 'segmentProject', header: '分部工程' },
    { col: 'D', width: 20, key: 'subsegmentProject', header: '子分部工程' },
    { col: 'E', width: 20, key: 'subitemProject', header: '分项工程' },
  ];

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
      throw new BadRequestException(`【${createDivisionDto.divisionName}】该分部分项已存在`);
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
      } else {
        division['outputValue'] = 0;
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

  /**
   * 导出模版
   */
  async exportDivisionTemplate() {
    const fillInstructions = `填写说明: \n1. 不存在的分部分项等级可以不填。\n2. 导入文件时不要删除此说明`;
    return await this.excelService.exportTableHeader({
      tableHeader: this.excelTableHeaders,
      fillInstructions: fillInstructions,
      sheetName: '分部分项导入模版',
    });
  }

  /**
   * 导入模版
   * @param file
   */
  async importDivision(file: Express.Multer.File) {
    const rows = await this.excelService.parseExcel(file, '分部分项导入模版', 3, this.excelTableHeaders);
    const insertRows = [];
    const nodeMap = new Map();

    function addDivision(name, type, parentId, rowNumber) {
      if (!nodeMap.has(name)) {
        insertRows.push({
          divisionName: name,
          divisionType: type,
          parentId: parentId || 0,
          rowNumber: rowNumber,
        });
        nodeMap.set(name, true);
      }
    }
    rows.forEach((row, index) => {
      const unitProject = row['unitProject'];
      const subunitProject = row['subunitProject'];
      const segmentProject = row['segmentProject'];
      const subsegmentProject = row['subsegmentProject'];
      const subitemProject = row['subitemProject'];

      if (unitProject !== null) {
        addDivision(unitProject, 'unitProject', 0, index);
      }
      if (subunitProject !== null) {
        addDivision(subunitProject, 'subunitProject', unitProject, index);
      }
      if (segmentProject !== null) {
        addDivision(segmentProject, 'segmentProject', subunitProject || unitProject, index);
      }
      if (subsegmentProject !== null) {
        addDivision(subsegmentProject, 'subsegmentProject', segmentProject || subunitProject || unitProject, index);
      }
      if (subitemProject !== null) {
        addDivision(
          subitemProject,
          'subitemProject',
          subsegmentProject || segmentProject || subunitProject || unitProject,
          index,
        );
      }
    });
    let errorCount = 0;
    const errorDetail = [];
    let successCount = 0;
    for (const row of insertRows) {
      if (row.parentId !== 0) {
        const parent = await this.prisma.division.findFirst({
          where: {
            ...(row.parentId && { divisionName: row.parentId }),
          },
        });

        row.parentId = parent ? parent.id : 0;
      }

      try {
        await this.create(row);
        // if (!['unitProject', 'subunitProject', 'segmentProject', 'subsegmentProject'].includes(row.divisionType)) {
        // }
        successCount++;
      } catch (error) {
        errorDetail.push({
          index: row.rowNumber,
          msg: error.message,
          success: false,
        });
        errorCount++;
      }
    }

    return {
      totalCount: insertRows.length,
      errorCount,
      errorDetail,
      successCount,
    };
  }
}
