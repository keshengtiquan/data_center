import { Injectable, Inject } from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { FindSectorListDto } from './dto/find-Sector-list.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindSectorListListDto } from './dto/find-sector-list-list.dto';
import Decimal from 'decimal.js';

@Injectable()
export class SectorService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建区段划分
   * @param createSectorDto
   * @returns
   */
  async create(createSectorDto: CreateSectorDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    this.prisma.$transaction(async (prisma) => {
      const sector = await prisma.sector.create({
        data: {
          tenantId,
          deptId: createSectorDto.deptId,
          divisions: createSectorDto.divisions,
          sectorName: createSectorDto.sectorName,
          sortNumber: createSectorDto.sortNumber,
          workPlaces: createSectorDto.workPlaces,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });

      return sector;
    });
  }

  /**
   * 查询区段划分列表
   * @param FindSectorListDto
   * @returns
   */
  async findAll(findSectorListDto: FindSectorListDto) {
    const { current, pageSize, sectorName } = findSectorListDto;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const condition = {
      ...(sectorName && { sectorName: { contains: sectorName } }),
      deleteflag: 0,
      tenantId,
    };
    const list = await this.prisma.sector.findMany({
      where: condition,
      include: {
        Dept: true,
      },
      skip: (current - 1) * pageSize,
      take: pageSize,
    });
    // 转换工点
    const workPlaceIds = new Set<number>();
    list.forEach((item) => {
      JSON.parse(item.workPlaces).forEach((id) => {
        workPlaceIds.add(id);
      });
    });
    const workPlaceList = await this.prisma.workPlace.findMany({
      where: {
        id: { in: Array.from(workPlaceIds) },
        deleteflag: 0,
        tenantId,
      },
    });
    const results = await Promise.all(
      list.map(async (sector) => {
        const workPlaces = JSON.parse(sector.workPlaces);
        const list = await this.getSectorList({ divisions: sector.divisions, workPlaces: sector.workPlaces });
        const outputValue = list.reduce((acc, curr) => {
          return (acc += curr.sumPrice);
        }, 0);
        const obj = {
          ...sector,
          outputValue,
          workPlaceNames: workPlaces.map((item) => {
            const workPlace = workPlaceList.find((workPlace) => workPlace.id === item);
            return workPlace.workPlaceName;
          }),
        };
        return obj;
      }),
    );

    return {
      results: results,
      pageSize,
      current,
      total: await this.prisma.sector.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询区段划分
   * @param id
   * @returns
   */
  async findOne(id: number) {
    const list = await this.prisma.sector.findUnique({
      where: { id },
    });
    list.divisions = JSON.parse(list.divisions);
    list.workPlaces = JSON.parse(list.workPlaces);

    return list;
  }

  /**
   * 更新区段划分
   * @param id
   * @returns
   */
  async update(updateSectorDto: UpdateSectorDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.sector.update({
      where: { id: updateSectorDto.id },
      data: {
        deptId: updateSectorDto.deptId,
        divisions: updateSectorDto.divisions,
        sectorName: updateSectorDto.sectorName,
        sortNumber: updateSectorDto.sortNumber,
        workPlaces: updateSectorDto.workPlaces,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除区段划分
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.sector.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除区段划分
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.sector.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 查村区段下的清单
   * @param findSectorList
   */
  async getSectorList(findSectorList: FindSectorListListDto) {
    const { divisions, workPlaces } = findSectorList;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    // 查询所选的分部分项清单
    const lists = await this.prisma.list.findMany({
      where: {
        deleteflag: 0,
        tenantId,
        currentSection: {
          in: JSON.parse(divisions),
        },
      },
    });
    const listIds = lists.map((item) => item.id);

    // 查询工点下的清单
    const findWorkPlaces = await this.prisma.workPlace.findMany({
      where: {
        deleteflag: 0,
        id: {
          in: JSON.parse(workPlaces),
        },
      },
      include: {
        WorkPlaceList: {
          where: {
            deleteflag: 0,
            listId: {
              in: listIds,
            },
          },
        },
      },
    });
    const workPlaceList = [];
    findWorkPlaces.forEach((workPlace) => {
      workPlace.WorkPlaceList.forEach((item) => {
        workPlaceList.push({
          listId: item.listId,
          allQuantities: item.allQuantities,
        });
      });
    });
    // 合并相同的listID的工程量
    const mergeList: { listId: number; allQuantities: number }[] = Object.values(
      workPlaceList.reduce((acc, curr) => {
        const { listId, allQuantities } = curr;
        if (acc[listId]) {
          acc[listId].allQuantities += allQuantities;
        } else {
          acc[listId] = { listId, allQuantities };
        }
        return acc;
      }, {}),
    );
    const results = lists.map((list) => {
      const merge = mergeList.find((item) => item.listId === list.id);
      const obj = {
        ...list,
        sectorQuantities: merge?.allQuantities || 0,
        sumPrice: Number(Decimal.mul(merge?.allQuantities || 0, list.unitPrice)),
      };
      return obj;
    });
    return results;
  }
}
