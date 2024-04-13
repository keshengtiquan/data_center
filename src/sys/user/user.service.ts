import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindListDto } from './dto/find-list.dto';
import { ForbiddenUserDto } from './dto/forbidden-user.dto';
import { excludeFun } from 'src/utils/prisma';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { USER_TYPE } from 'src/common/enum';
import { ClsService } from 'nestjs-cls';
import { CompanyDeptService } from '../company-dept/company-dept.service';
import { extractSubNodeList } from 'src/utils/tree';
import { ExcelService } from 'src/excel/excel.service';

@Injectable()
export class UserService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(CompanyDeptService)
  private readonly companyDeptService: CompanyDeptService;
  @Inject(ExcelService)
  private readonly excelService: ExcelService;

  private readonly tableHeader = [
    { col: 'A', width: 20, key: 'userName', header: '账号*' },
    { col: 'B', width: 20, key: 'nickName', header: '姓名' },
    { col: 'C', width: 20, key: 'gender', header: '性别' },
    { col: 'D', width: 20, key: 'companyDeptId', header: '所属机构' },
    { col: 'E', width: 20, key: 'email', header: '邮箱' },
    { col: 'F', width: 20, key: 'tel', header: '电话' },
    { col: 'G', width: 20, key: 'remark', header: '备注' },
  ];

  /**
   * 创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    const userInfo = this.cls.get('headers').user as User;
    const headers = this.cls.get('headers').headers;
    try {
      const user = await this.prisma.user.create({
        data: {
          userName: createUserDto.userName,
          password: createUserDto.password,
          nickName: createUserDto.nickName,
          email: createUserDto.email,
          phoneNumber: createUserDto.phoneNumber,
          gender: createUserDto.gender,
          companyDeptId: createUserDto.companyDeptId,
          remark: createUserDto.remark,
          createBy: (userInfo && userInfo.userName) || '',
          updateBy: (userInfo && userInfo.userName) || '',
          defaultProjectId: createUserDto.defaultProjectId,
          ...(headers['x-tenant-id'] && {
            tenants: {
              create: {
                tenant: {
                  connect: {
                    id: +headers['x-tenant-id'],
                  },
                },
              },
            },
          }),
        },
      });
      return excludeFun(user, ['password']);
    } catch (error) {
      throw new BadRequestException('用户创建失败');
    }
  }

  /**
   * 查询用户列表
   * @param getListDto
   */
  async getList(findListDto: FindListDto) {
    const { pageSize, current, nickName, userName, tenantId, companyDeptId, status } = findListDto;
    // 排除项目中已有的用户ID
    let userIds = [];
    if (tenantId) {
      const data = await this.prisma.tenantsOnUsers.findMany({
        where: { tenantId: tenantId },
      });
      userIds = data.map((item) => item.userId);
    }
    //根据组织机构ID查询本级及下级的用户
    let companyDeptIds = [];
    if (companyDeptId) {
      const companyDept = await this.companyDeptService.getlist();
      companyDeptIds = extractSubNodeList(companyDept, companyDeptId);
    }

    const condition = {
      ...(nickName && { nickName: { contains: nickName } }),
      ...(userName && { userName: { contains: userName } }),
      ...(userIds.length > 0 && { id: { notIn: userIds } }),
      ...(companyDeptIds.length > 0 && {
        companyDeptId: { in: companyDeptIds },
      }),
      ...(status && { status: status }),
      deleteflag: 0,
    };

    const list = await this.prisma.user.findMany({
      skip: (current - 1) * pageSize,
      take: pageSize,
      where: condition,
      include: {
        tenants: { include: { tenant: true } },
        CompanyDept: { where: { deleteflag: 0 } },
      },
    });

    return {
      results: list
        .filter((item) => item.userName !== 'superAdmin')
        .map((item) => {
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
    const userInfo = this.cls.get('headers').user as User;
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user.id === userInfo.id) {
      throw new BadRequestException('不能禁用自己');
    }
    if (user.userType === USER_TYPE.SYSTEM_USER) {
      throw new BadRequestException('不能禁用系统用户');
    }
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
    const userInfo = this.cls.get('headers').user as User;
    const { id } = updateUserDto;
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          userName: updateUserDto.userName,
          nickName: updateUserDto.nickName,
          email: updateUserDto.email,
          phoneNumber: updateUserDto.phoneNumber,
          gender: updateUserDto.gender,
          avatar: updateUserDto.avatar,
          remark: updateUserDto.remark,
          updateBy: userInfo.userName,
          companyDeptId: updateUserDto.companyDeptId,
        },
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

  /**
   * Excel导入用户
   * @param file
   */
  async importUserFile(file: Express.Multer.File) {
    console.log(file);
    // 1. 解析表格，获取所有的行数据
    const rows = await this.excelService.parseExcel(file, 'sys_user', 3)
    console.log(rows);
    // 2. 遍历每一行数据，创建
  }

  /**
   * 导出用户模板
   */
  async exportUserTemplate() {

    const fillInstructions = `填写说明: \n1. 账号：必填，不能重复。 \n2. 密码默认为123456。 \n3. 标*为必填字段`;
    const select = [{ column: 'C', start: 3, end: 50, formulae: '"未知,男,女"' }];
    return await this.excelService.exportTableHeader({
      tableHeader: this.tableHeader,
      fillInstructions: fillInstructions,
      select
    });
  }
}
