import { Injectable, Inject } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindListListDto } from './dto/find-list-list.dto';

@Injectable()
export class ListService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建清单
   * @param createListDto
   * @returns
   */
  async create(createListDto: CreateListDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const list = await this.prisma.list.create({
      data: {
        combinedPrice: createListDto.combinedPrice,
        listCharacteristic: createListDto.listCharacteristic,
        listCode: createListDto.listCode,
        listName: createListDto.listName,
        quantities: createListDto.quantities,
        serialNumber: createListDto.serialNumber,
        unit: createListDto.unit,
        unitPrice: createListDto.unitPrice,
        tenantId: tenantId,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      },
    });
    // excel 导入时使用
    if (createListDto.divisionName) {
      const division = await this.prisma.division.findFirst({
        where: {
          divisionName: createListDto.divisionName,
        },
      });
      await this.prisma.list.update({
        where: { id: list.id },
        data: {
          currentSection: division.id,
          sectionalEntry: division.parentNames,
        },
      });
    }
    return list;
  }

  /**
   * 查询清单列表
   * @param FindListListDto
   * @returns
   */
  async findAll(findListListDto: FindListListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const {
      current,
      pageSize,
      listCharacteristic,
      listCode,
      listName,
      sectionalEntry,
      notDivision,
      workPlaceIdExclude,
    } = findListListDto;
    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      ...(sectionalEntry && { sectionalEntry: { contains: String(sectionalEntry) } }), //分部分项下的清单
      ...(notDivision && { currentSection: null }), //不分部分项下的清单
      tenantId,
      deleteflag: 0,
    };

    // 查询工点下没有分配的清单
    if (workPlaceIdExclude) {
      const workPlace = await this.prisma.workPlace.findUnique({
        where: { id: workPlaceIdExclude },
        include: {
          WorkPlaceList: {
            where: {
              deleteflag: 0,
            },
          },
        },
      });
      const listIds = workPlace.WorkPlaceList.map((item) => item.listId);
      condition['id'] = { notIn: listIds}
    }

    const list = await this.prisma.list.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.list.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询清单
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.list.findUnique({
      where: { id },
    });
  }

  /**
   * 更新清单
   * @param id
   * @returns
   */
  async update(updateListDto: UpdateListDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.list.update({
      where: { id: updateListDto.id },
      data: {
        combinedPrice: updateListDto.combinedPrice,
        listCharacteristic: updateListDto.listCharacteristic,
        listCode: updateListDto.listCode,
        listName: updateListDto.listName,
        quantities: updateListDto.quantities,
        serialNumber: updateListDto.serialNumber,
        unit: updateListDto.unit,
        unitPrice: updateListDto.unitPrice,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除清单
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.list.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除清单
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.list.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }
}
