import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateTenantPackageDto } from './dto/create-tenant-package.dto';
import { UpdateTenantPackageDto } from './dto/update-tenant-package.dto';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { FindPackageListDto } from './dto/find-tenant-package.dto';

@Injectable()
export class TenantPackageService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建套餐
   * @param createTenantPackageDto
   * @returns
   */
  async create(createTenantPackageDto: CreateTenantPackageDto) {
    const userInfo = this.cls.get('userInfo').user as User;

    try {
      return this.prisma.tenantPackage.create({
        data: {
          packageName: createTenantPackageDto.packageName,
          remark: createTenantPackageDto.remark,
          menuIds: createTenantPackageDto.menuIds,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException('创建套餐失败');
    }
  }

  /**
   * 查询套餐列表
   */
  async getList(findPackageListDto: FindPackageListDto) {
    const { current, pageSize, packageName } = findPackageListDto;
    const condition = {
      ...(packageName && { packageName: { contains: packageName } }),
      deleteflag: 0,
    };
    const list = await this.prisma.tenantPackage.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.tenantPackage.count({ where: condition }),
    };
  }

  /**
   * 根据ID获取套餐列表
   * @param id
   */
  async getOne(id: number) {
    return await this.prisma.tenantPackage.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * 更新套餐
   * @param updatePackageDto
   */
  async update(updatePackageDto: UpdateTenantPackageDto) {
    const userInfo = this.cls.get('userInfo').user as User;
    try {
      return await this.prisma.tenantPackage.update({
        where: { id: updatePackageDto.id },
        data: {
          packageName: updatePackageDto.packageName,
          menuIds: updatePackageDto.menuIds,
          remark: updatePackageDto.remark,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException('更新失败');
    }
  }

  /**
   * 删除套餐
   * @param id 套餐id
   */
  async delete(id: number) {
    try {
      return await this.prisma.tenantPackage.update({
        where: { id },
        data: {
          deleteflag: 1,
        },
      });
    } catch (error) {
      throw new BadRequestException('删除失败');
    }
  }
}
