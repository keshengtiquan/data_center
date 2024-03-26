import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateDictDto } from './dto/create-dict.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
import { handleTree } from 'src/utils/tree';
import { FindDictListDto } from './dto/dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';

@Injectable()
export class DictService {
  @Inject(PrismaService)
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 创建字典
   * @param createDictDto
   */
  async create(createDictDto: CreateDictDto) {
    const userInfo = this.cls.get('headers').user as User;
    const dict = await this.prisma.dict.findFirst({
      where: {
        dictValue: createDictDto.dictValue,
        parentId: createDictDto.parentId,
        deleteflag: 0,
      },
    });
    if (dict) {
      throw new BadRequestException('字典值已存在');
    }
    await this.prisma.dict.create({
      data: {
        parentId: createDictDto.parentId || 0,
        dictLabel: createDictDto.dictLabel,
        dictValue: createDictDto.dictValue,
        sortNumber: createDictDto.sortNumber,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 查询字典树表
   * @param parentId
   * @returns
   */
  async getTree() {
    const list = await this.prisma.dict.findMany({
      where: {
        deleteflag: 0,
      },
    });
    return handleTree(list);
  }

  /**
   * 查询字典列表
   * @param findDictListDto
   */
  async getlist(findDictListDto: FindDictListDto) {
    const { current, pageSize, parentId } = findDictListDto;

    const condition = {
      ...(parentId && { OR: [{ id: parentId }, { parentId: parentId }] }),
      deleteflag: 0,
    };

    const list = await this.prisma.dict.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.dict.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询字典
   * @param id
   */
  async getOne(id: number) {
    return this.prisma.dict.findUnique({
      where: { id },
    });
  }

  /**
   * 修改字典
   * @param updateDictDto
   */
  async update(updateDictDto: UpdateDictDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.dict.update({
      where: { id: updateDictDto.id },
      data: {
        dictLabel: updateDictDto.dictLabel,
        dictValue: updateDictDto.dictValue,
        sortNumber: updateDictDto.sortNumber,
        parentId: updateDictDto.parentId,
        updateBy: userInfo.userName,
      },
    });
  }
}
