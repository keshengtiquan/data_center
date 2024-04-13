import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CreateWorkPlaceDto } from './dto/create-workPlace.dto';
import { UpdateWorkPlaceDto } from './dto/update-workPlace.dto';
import { FindWorkPlaceListDto } from './dto/find-workPlace-list.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindWorkPlaceListListDto } from './dto/find-workPlaceList-list.dto';
import Decimal from 'decimal.js';
import { SaveWorkPlaceListQuantities } from './dto/save-workPlace-quantity.dto';
import { FindWorkPlaceListCollectionDto } from './dto/find-workplace-list-collection.dto';

@Injectable()
export class WorkPlaceService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建工点
   * @param createWorkPlaceDto
   * @returns
   */
  async create(createWorkPlaceDto: CreateWorkPlaceDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    const find = await this.prisma.workPlace.findFirst({
      where: {
        workPlaceCode: createWorkPlaceDto.workPlaceCode,
        deleteflag: 0,
        tenantId,
      },
    });
    if (find) {
      throw new HttpException('工点编码已存在', HttpStatus.BAD_REQUEST);
    }

    return await this.prisma.workPlace.create({
      data: {
        tenantId: tenantId,
        workPlaceCode: createWorkPlaceDto.workPlaceCode,
        workPlaceName: createWorkPlaceDto.workPlaceName,
        workPlaceType: createWorkPlaceDto.workPlaceType,
        sortNumber: createWorkPlaceDto.sortNumber,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 查询工点列表
   * @param FindWorkPlaceListDto
   * @returns
   */
  async findAll(findWorkPlaceListDto: FindWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, workPlaceName, workPlaceType } = findWorkPlaceListDto;
    const condition = {
      ...(workPlaceName && { workPlaceName: { contains: workPlaceName } }),
      ...(workPlaceType && { workPlaceType: workPlaceType }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.workPlace.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: { sortNumber: 'asc' },
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.workPlace.count({ where: condition }),
    };
  }

  /**
   * 查询工点（无分页）
   * @param findWorkPlaceListDto
   */
  async findAllPaginationFree(findWorkPlaceListDto: FindWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { workPlaceName, workPlaceType } = findWorkPlaceListDto;
    const condition = {
      ...(workPlaceName && { workPlaceName: { contains: workPlaceName } }),
      ...(workPlaceType && { workPlaceType: workPlaceType }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.workPlace.findMany({
      where: condition,
      orderBy: { sortNumber: 'asc' },
    });
    return list;
  }

  /**
   * 根据ID查询工点
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.workPlace.findUnique({
      where: { id },
    });
  }

  /**
   * 更新工点
   * @param id
   * @returns
   */
  async update(updateWorkPlaceDto: UpdateWorkPlaceDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.workPlace.update({
      where: { id: updateWorkPlaceDto.id },
      data: {
        workPlaceCode: updateWorkPlaceDto.workPlaceCode,
        workPlaceName: updateWorkPlaceDto.workPlaceName,
        workPlaceType: updateWorkPlaceDto.workPlaceType,
        sortNumber: updateWorkPlaceDto.sortNumber,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除工点
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.workPlace.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除工点
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.workPlace.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 关联清单
   * @param id
   */
  async relationList(workPlaceId: number, listIds: number[]) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const createData = listIds.map((item) => {
      return {
        tenantId,
        workPlaceId,
        listId: item,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      };
    });

    return await this.prisma.workPlaceList.createMany({
      data: createData,
    });
  }

  /**
   * 查询工点下的清单
   * @param workPlaceId
   */
  async workPlaceList(findWorkPlaceListListDto: FindWorkPlaceListListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, listCharacteristic, workPlaceId, listCode, listName } = findWorkPlaceListListDto;

    const workPlaceList = await this.prisma.workPlaceList.findMany({
      where: {
        tenantId,
        deleteflag: 0,
        workPlaceId,
      },
    });

    const listIds = workPlaceList.map((item) => item.listId);

    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      id: { in: listIds },
      tenantId,
      deleteflag: 0,
    };
    const listInfo = await this.prisma.list.findMany({
      where: condition,
      select: {
        id: true,
        listCode: true,
        serialNumber: true,
        listName: true,
        listCharacteristic: true,
        unit: true,
        unitPrice: true,
      },
    });

    const list = listInfo.map((list) => {
      const workPlace = workPlaceList.find((item) => item.listId === list.id);
      const { id, ...other } = list;
      const obj = {
        ...other,
        listId: id,
        allQuantities: null,
        leftQuantities: null,
        rightQuantities: null,
        combinedPrice: null,
      };
      if (workPlace) {
        obj['id'] = workPlace.id;
        obj.allQuantities = workPlace.allQuantities;
        obj.leftQuantities = workPlace.leftQuantities;
        obj.rightQuantities = workPlace.rightQuantities;
        if (workPlace.allQuantities) {
          obj.combinedPrice = Number(Decimal.mul(workPlace.allQuantities, list.unitPrice));
        }
      }
      return obj;
    });

    return {
      results: list,
      current,
      pageSize,
      total: 2,
    };
  }

  /**
   * 删除工点下的清单
   * @param id
   */
  async deleteWorkPlaceList(id: number) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    return await this.prisma.workPlaceList.update({
      where: { id: id, tenantId },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 批量删除工点下的清单
   * @param ids
   */
  async batchDeleteWorkPlaceList(ids: number[]) {
    await this.prisma.workPlaceList.updateMany({
      where: { id: { in: ids } },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 保存工点工程量
   * @param saveWorkPlaceListQuantities
   */
  async saveWorkPlaceListQuantities(saveWorkPlaceListQuantities: SaveWorkPlaceListQuantities) {
    return await this.prisma.workPlaceList.update({
      where: { id: saveWorkPlaceListQuantities.id },
      data: {
        leftQuantities: saveWorkPlaceListQuantities.leftQuantities,
        rightQuantities: saveWorkPlaceListQuantities.rightQuantities,
        allQuantities: saveWorkPlaceListQuantities.allQuantities,
      },
    });
  }

  /**
   * 获取工点汇总表
   * @param findWorkPlaceListCollectionDto
   */
  async findWorkPlaceListCollection(findWorkPlaceListCollectionDto: FindWorkPlaceListCollectionDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, sectionalEntry } = findWorkPlaceListCollectionDto;
    const condition = {
      ...(sectionalEntry && { sectionalEntry: { contains: sectionalEntry } }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.list.findMany({
      where: condition,
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    const workPlace = await this.prisma.workPlace.findMany({
      where: { deleteflag: 0, tenantId },
      include: {
        WorkPlaceList: { where: { deleteflag: 0 } },
      },
    });
    const results = [];
    const workPlaceArr = [];
    workPlace.forEach((workPlace) => {
      if (workPlace.WorkPlaceList.length > 0) {
        workPlace.WorkPlaceList.forEach((item) => {
          const obj = {};
          obj['listId'] = item.listId;
          obj[`${workPlace.workPlaceCode}`] = {
            allQuantities: item.allQuantities,
            leftQuantities: item.leftQuantities,
            rightQuantities: item.rightQuantities,
          };
          workPlaceArr.push(obj);
        });
      }
    });

    list.forEach((list) => {
      const tem = workPlaceArr.filter((item) => item.listId === list.id);
      const obj = { ...list };
      let total = 0;
      if (tem.length > 0) {
        tem.forEach((item) => {
          delete item.listId;
          const key = Object.keys(item)[0];
          total += item[key].allQuantities;
          Object.assign(obj, item);
        });
      }
      obj['total'] = total;
      results.push(obj);
    });
    return {
      results: results,
      total: await this.prisma.list.count({ where: condition }),
      current,
      pageSize,
    };
  }
}
