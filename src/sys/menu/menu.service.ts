import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
import { handleTree } from 'src/utils/tree';
import { ForbiddenMenuDto } from './dto/forbidden-menu.dto';
import { Memu_Module, USER_TYPE } from 'src/common/enum';

@Injectable()
export class MenuService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建菜单
   * @param createMenuDto
   * @returns
   */
  async create(createMenuDto: CreateMenuDto) {
    const userInfo = this.cls.get('headers').user as User;
    try {
      const res = await this.prisma.menu.create({
        data: {
          ...createMenuDto,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
      const menus = await this.prisma.menu.findMany();
      res.activeMenu = this.getParentIds(createMenuDto.path, 'path', menus);
      const { id, ...other } = res;
      return await this.prisma.menu.update({
        where: { id },
        data: { ...other },
      });
    } catch (error) {
      throw new BadRequestException('创建失败');
    }
  }

  /**
   * 获取菜单数据
   */
  async getMenu(menuType: string[], status: string[], module: string) {
    const userInfo = this.cls.get('headers').user as any;
    const headers = this.cls.get('headers');

    const condition: Record<string, any> = {
      menuType: { in: menuType },
      status: { in: status },
      module: module,
      deleteflag: 0,
    };
    // 项目管理员访问项目套餐呢的所有菜单
    if (userInfo.userType === USER_TYPE.PROJECT_ADMIN) {
      const tenantPackage = await this.prisma.tenant.findUnique({
        where: {
          id:
            +headers.headers['x-tenant-id'] ||
            userInfo.defaultProjectId ||
            userInfo.tenants[0].tenantId,
        },
        include: { tenantPackage: true },
      });
      condition.id = {
        in: tenantPackage.tenantPackage.menuIds.split(',').map((item) => +item),
      };
      condition.module = Memu_Module.PROJECT;
    }
    // if (userInfo.userType === USER_TYPE.GENERAL_USER) {

    // }
    const menu = await this.prisma.menu.findMany({
      where: condition,
      orderBy: {
        menuSort: 'asc',
      },
    });
    return handleTree(menu);
  }

  /**
   * 更新菜单
   * @param updateMenuDto
   */
  async update(updateMenuDto: UpdateMenuDto) {
    const menus = await this.prisma.menu.findMany();
    updateMenuDto['activeMenu'] = this.getParentIds(
      updateMenuDto.path,
      'path',
      menus,
    );
    const { id, ...other } = updateMenuDto;
    try {
      return await this.prisma.menu.update({
        where: { id },
        data: { ...other },
      });
    } catch (error) {
      throw new BadRequestException('更新菜单失败');
    }
  }

  /**
   * 根据ID获取菜单数据
   * @param id
   */
  async getMenuById(id: number) {
    return await this.prisma.menu.findUnique({
      where: { id },
    });
  }

  /**
   * 禁用菜单
   * @param forbiddenMenuDto
   */
  async forbidden(forbiddenMenuDto: ForbiddenMenuDto) {
    try {
      return await this.prisma.menu.update({
        where: { id: forbiddenMenuDto.id },
        data: { status: forbiddenMenuDto.status },
      });
    } catch (error) {
      throw new BadRequestException('禁用菜单失败');
    }
  }

  /**
   * 删除菜单
   * @param id
   */
  async delete(id: number) {
    try {
      await this.prisma.menu.update({
        where: { id },
        data: { deleteflag: 1 },
      });
    } catch (error) {
      throw new BadRequestException('删除菜单失败');
    }
  }

  getParentIds(parentPath: string, uniqueId: string, tree: any[]): string {
    const deptMap: { [key: string]: string } = {};
    tree.forEach((item) => {
      deptMap[item[uniqueId]] = item.path;
    });

    const parentPaths: string[] = [];
    let currentPath = parentPath;

    while (currentPath !== '/' && deptMap[currentPath]) {
      parentPaths.push(deptMap[currentPath]);
      currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    }

    return JSON.stringify(parentPaths.reverse());
  }
}
