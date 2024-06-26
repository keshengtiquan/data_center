import { Inject, Injectable } from '@nestjs/common';
import { CreateMajorQuantityDto } from './dto/create-major-quantity.dto';
import { UpdateMajorQuantityDto } from './dto/update-major-quantity.dto';
import { PrismaService } from '../../prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
import { handleTree } from '../../utils/tree';

@Injectable()
export class MajorQuantityService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async create(createMajorQuantityDto: CreateMajorQuantityDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    console.log('aaa', tenantId);
    return await this.prisma.majorQuantity.create({
      data: {
        tenantId,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
        parentId: createMajorQuantityDto.parentId,
        name: createMajorQuantityDto.name,
        index: createMajorQuantityDto.index,
        unit: createMajorQuantityDto.unit,
      },
    });
  }

  async findAll() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const list = await this.prisma.majorQuantity.findMany({
      where: {
        tenantId,
        deleteflag: 0,
      },
    });

    return handleTree(list);
  }

  async findOne(id: number) {
    return await this.prisma.majorQuantity.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateMajorQuantityDto: UpdateMajorQuantityDto) {
    const userInfo = this.cls.get('headers').user as User;
    console.log(userInfo);
    return await this.prisma.majorQuantity.update({
      where: { id },
      data: {
        parentId: updateMajorQuantityDto.parentId,
        name: updateMajorQuantityDto.name,
        index: updateMajorQuantityDto.index,
        unit: updateMajorQuantityDto.index,
        updateBy: userInfo.userName,
      },
    });
  }

  async calculation(id: number, listIds: number[], calculation: string) {
    const lists = await this.prisma.list.findMany({
      where: {
        id: {
          in: listIds,
        },
      },
      select: {
        quantities: true,
      },
    });

    const quantities = lists.map((item) => item.quantities);
    
    let cal = 0

    switch (calculation) {
      case 'sum':
        cal = quantities.reduce((a, b) => a + b);
        break;
      case 'average':
        cal =  this.calculateAverage(quantities)
        break;
      case 'max':
        cal =  Math.max(...quantities);
        break;
      case 'min':
        cal = Math.min(...quantities);
        break;
      default:
        return 0;
    }

    await this.prisma.majorQuantity.update({
      where: { id },
      data: {
        num: cal.toString()
      }
    })
  }

  calculateAverage(arr) {
    // 判断数组是否为空
    if (arr.length === 0) {
      return 0;
    }

    // 计算数组元素的总和
    const sum = arr.reduce((acc, val) => acc + val, 0);

    // 计算平均值
    const average = Number((sum / arr.length).toFixed(2));

    return average;
  }

  async remove(id: number) {
    await this.prisma.majorQuantity.update({
      where: { id },
      data: {
        deleteflag: 1,
      },
    })
  }
}
