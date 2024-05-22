import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindRoleListDto } from './dto/find-role-list.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleMenuDto } from './dto/role-menu.dto';
import { AddUserDto } from './dto/add-user.dto';
import { FindRoleUserDto } from './dto/find-role-user.dto';

@Injectable()
export class RoleService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async create(createRoleDto: CreateRoleDto) {
    const userInfo = this.cls.get('headers').user as User;
    const headers = this.cls.get('headers').headers as Headers;
    const findRoleName = await this.prisma.role.findFirst({
      where: {
        roleName: createRoleDto.roleName,
        deleteflag: 0,
      },
    });
    //TODO 关联清单、 userInfo的值要改
    if (findRoleName) {
      throw new HttpException('角色名称已存在', HttpStatus.BAD_REQUEST);
    }
    const findRoleKey = await this.prisma.role.findFirst({
      where: {
        roleKey: createRoleDto.roleKey,
        deleteflag: 0,
      },
    });
    if (findRoleKey) {
      throw new HttpException('角色key已存在', HttpStatus.BAD_REQUEST);
    }
    try {
      return this.prisma.role.create({
        data: {
          roleName: createRoleDto.roleName,
          roleKey: createRoleDto.roleKey,
          roleSort: createRoleDto.roleSort,
          remark: createRoleDto.remark,
          tenantId: +headers['x-tenant-id'],
          createDept: userInfo.deptId,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 获取角色列表
   * @param findRoleListDto
   * @returns
   */
  async getList(findRoleListDto: FindRoleListDto) {
    const headers = this.cls.get('headers').headers as Headers;

    const { current, pageSize, roleName, status } = findRoleListDto;
    const condition = {
      ...(roleName && { roleName: { contains: roleName } }),
      ...(status && { status: status }),
      tenantId: +headers['x-tenant-id'],
      deleteflag: 0,
    };
    const list = await this.prisma.role.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });
    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.role.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询角色
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.role.findUnique({
      where: { id },
    });
  }

  /**
   * 更新角色
   * @param id
   * @returns
   */
  async update(updateRoleDto: UpdateRoleDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.role.update({
      where: { id: updateRoleDto.id },
      data: {
        remark: updateRoleDto.remark,
        roleKey: updateRoleDto.roleKey,
        roleName: updateRoleDto.roleName,
        roleSort: updateRoleDto.roleSort,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除角色
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.role.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }
  /**
   * 批量删除角色
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.role.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 关联菜单
   * @param roleMenuDto
   */
  async roleMenu(roleMenuDto: RoleMenuDto) {
    const { roleId, menuIds } = roleMenuDto;
    const role = this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new HttpException('角色不存在', HttpStatus.BAD_REQUEST);
    }
    try {
      const createDate = menuIds.map((item) => {
        return { menuId: item, roleId: roleId };
      });
      this.prisma.$transaction(async (prisma) => {
        await prisma.menusOnRoles.deleteMany({
          where: { roleId: roleId },
        });
        await prisma.menusOnRoles.createMany({
          data: createDate,
        });
      });
    } catch (error) {}
  }

  /**
   * 查询角色下的用户
   * @param id
   */
  async roleUser(findRoleUserDto: FindRoleUserDto) {
    const { current, pageSize, roleId } = findRoleUserDto;
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });
    const userIds = role.users.map((item) => {
      return item.userId;
    });
    const condition = {
      id: { in: userIds },
      deleteflag: 0,
      status: '0',
    };
    const list = await this.prisma.user.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.user.count({ where: condition }),
    };
  }

  /**
   * 角色添加用户
   * @param addUserDto
   */
  async addUser(addUserDto: AddUserDto) {
    const { roleId } = addUserDto;
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        users: true,
      },
    });
    const users = role.users.map((item) => {
      return item.userId;
    });
    const userIds = addUserDto.userIds.filter((item) => !users.includes(item));

    return await this.prisma.usersOnRoles.createMany({
      data: userIds.map((item) => {
        return {
          roleId: roleId,
          userId: item,
        };
      }),
    });
  }

  /**
   * 查询角色关联的菜单
   * @param id
   */
  async roleMenuList(id: number) {
    const menuRole = await this.prisma.menusOnRoles.findMany({
      where: { roleId: id },
    });
    const menuIds = menuRole.map((item) => {
      return item.menuId;
    });
    return menuIds;
  }
}
