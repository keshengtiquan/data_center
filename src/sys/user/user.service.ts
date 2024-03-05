import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindListDto } from './dto/find-list.dto';
import { ForbiddenUserDto } from './dto/forbidden-user.dto';
import { excludeFun } from 'src/utils/prisma';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  @Inject()
  private prisma: PrismaService;

  /**
   * 创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    try {
      await this.prisma.user.create({
        data: createUserDto,
      });
      return '用户创建成功';
    } catch (error) {
      throw new BadRequestException('用户创建失败');
    }
  }

  /**
   * 查询用户列表
   * @param getListDto
   */
  async getList(findListDto: FindListDto) {
    const { pageSize, current, nickName, userName } = findListDto;
    const condition = {
      ...(nickName && { nickName: { contains: nickName } }),
      ...(userName && { userName: { contains: userName } }),
      deleteflag: 0,
    };
    const list = await this.prisma.user.findMany({
      skip: (current - 1) * pageSize,
      take: pageSize,
      where: condition,
    });
    return {
      results: list.map((item) => {
        return excludeFun(item, ['password']);
      }),
      total: await this.prisma.user.count({ where: condition }),
      current,
      pageSize,
    };
  }

  /**
   * 禁用用户
   * @param
   */
  async forbidden({ id, status }: ForbiddenUserDto) {
    // const user = await this.prisma.user.findUnique({ where: { id } });
    //TODO 不能禁用系统用户、无权禁用系统用户
    try {
      await this.prisma.user.update({
        where: { id },
        data: { status },
      });
      return '用户禁用成功';
    } catch (error) {
      throw new BadRequestException('用户禁用失败');
    }
  }

  /**
   * 根据id获取用户信息
   * @param id
   * @returns
   */
  async getOneById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    const userWithoutPassword = excludeFun(user, ['password']);
    return userWithoutPassword;
  }

  /**
   * 更新用户
   * @param updateUserDto
   */
  async update(updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);

    const { id, ...other } = updateUserDto;
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { ...other },
      });
      return excludeFun(user, ['password']);
    } catch (error) {
      throw new BadRequestException('用户更新失败');
    }
  }

  /**
   * 删除用户
   * @param id
   */
  async delete(id: number, userInfo: User) {
    //TODO 你无权限删除系统用户
    if (id === userInfo.id) {
      throw new BadRequestException('不能删除自己');
    }
    await this.prisma.user.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }
}
