import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindRoleListDto } from './dto/find-role-list.dto';

@Injectable()
export class RoleService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async create(createRoleDto: CreateRoleDto) {
    const userInfo = this.cls.get('userInfo').user as User;
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
    const userInfo = this.cls.get('userInfo').user as User;

    const { current, pageSize } = findRoleListDto;
    const condition = {
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
}
