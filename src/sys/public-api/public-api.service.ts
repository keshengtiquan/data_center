import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindListDto } from './dto/find-project-list.dto';
import { HttpPost } from 'src/common/api';
import { FindWorkPlaceListDto } from './dto/find-workplace-list.dto';

@Injectable()
export class PublicApiService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async generateLog() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        deleteflag: 0,
      },
      select: {
        id: true,
      },
    });
    await HttpPost('generateLog', { date: new Date(), tenants });
  }

  async getProjectList(findListDto: FindListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, listIds, listCharacteristic, listCode, listName, sectionalEntry, notInIds } = findListDto;
    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      ...(sectionalEntry && { sectionalEntry: { contains: String(sectionalEntry) } }), //分部分项下的清单
      ...(listIds && { id: { in: listIds } }), // 查询指定清单
      ...(notInIds && { id: { notIn: notInIds } }),
      tenantId,
      deleteflag: 0, 
    };

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

  async getTeamList() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return this.prisma.dept.findMany({
      where: {
        deleteflag: 0,
        tenantId,
        deptType: 'operation_team',
      },
    });
  }

  async getOperationTeamList(findListDto: FindListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const depts = await this.prisma.dept.findMany({
      where: {
        deleteflag: 0,
        tenantId,
      },
      include: {
        Sector: {
          where: {
            deleteflag: 0,
          },
        },
      },
    });
    // console.log(depts);
    // 查询部门下的工点
    const deptWorkPlaces = depts
      .map((dept) => {
        return dept.Sector.map((sector) => {
          return {
            deptId: sector.deptId,
            workPlaces: JSON.parse(sector.workPlaces),
          };
        });
      })
      .flat();
    const deptWorkPlace = deptWorkPlaces.reduce((acc, item) => {
      const existingItem = acc.find((entry) => entry.deptId === item.deptId);
      if (existingItem) {
        existingItem.workPlaces = Array.from(new Set(existingItem.workPlaces.concat(item.workPlaces)));
      } else {
        acc.push({ deptId: item.deptId, workPlaces: item.workPlaces });
      }
      return acc;
    }, []);
    const workPlaceIds = new Set<number>();
    deptWorkPlace.forEach((item) => {
      item.workPlaces.forEach((ele) => {
        workPlaceIds.add(ele);
      });
    });
    const workPlaceList = await this.prisma.workPlaceList.findMany({
      where: {
        deleteflag: 0,
        workPlaceId: { in: [...workPlaceIds] },
      },
    });
    // console.log(workPlaceList);
    deptWorkPlace.forEach((item) => {
      item.workPlaces = item.workPlaces
        .map((ele) => {
          const find = workPlaceList.filter((ele2) => ele2.workPlaceId === ele && ele2.deleteflag === 0);
          return find;
        })
        .flat();
    });

    const result = deptWorkPlace.reduce((acc, item) => {
      item.workPlaces.forEach((workPlace) => {
        if (workPlace.listId !== undefined) {
          const existingEntry = acc.find((entry) => entry.listId === workPlace.listId);
          if (existingEntry) {
            existingEntry[item.deptId] = (existingEntry[item.deptId] || 0) + (workPlace.allQuantities || 0);
          } else {
            const newEntry = { listId: workPlace.listId };
            newEntry[item.deptId] = workPlace.allQuantities || 0;
            acc.push(newEntry);
          }
        }
      });
      return acc;
    }, []);
    result.forEach((entry) => {
      let totalQuantities = 0;
      Object.keys(entry).forEach((key) => {
        if (key !== 'listId' && !isNaN(entry[key])) {
          totalQuantities += entry[key];
        }
      });
      entry.totalQuantities = totalQuantities;
    });

    console.log(result);
    const list = await this.getProjectList(findListDto);
    list.results = list.results.map((item) => {
      const find = result.find((ele) => ele.listId === item.id);
      return {
        ...item,
        ...find,
      };
    });

    return list;
  }

  async getWorkPlaceList(findWorkPlaceListDto: FindWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { listId, isPage, current, pageSize } = findWorkPlaceListDto;
    console.log(isPage);

    const condition = {
      deleteflag: 0,
      tenantId,
      ...(listId && {
        WorkPlaceList: {
          some: {
            listId,
            deleteflag: 0,
          },
        },
      }),
    };

    const workPlaceList = await this.prisma.workPlace.findMany({
      where: condition,
      take: isPage ? pageSize : undefined,
      skip: isPage ? (current - 1) * pageSize : undefined,
    });

    return workPlaceList;
  }

  async getPlanQuantities(findListDto: FindListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { listCharacteristic, listCode, listName, sectionalEntry } = findListDto;
    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      ...(sectionalEntry && { sectionalEntry: { contains: String(sectionalEntry) } }), //分部分项下的清单
      tenantId,
      deleteflag: 0,
    };
    return await this.prisma.workPlaceList.groupBy({
      by: ['listId'],
      _sum: {
        allQuantities: true,
      },
      where: condition,
    });
  }
}
