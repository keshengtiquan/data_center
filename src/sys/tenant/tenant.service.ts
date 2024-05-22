import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { PrismaService } from 'src/prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
import { md5 } from 'src/utils/md5';
import { FindTenantListDto } from './dto/find-tenant-list.dto';
import { ForbiddenTenantDto } from './dto/forbidden-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { USER_TYPE } from 'src/common/enum';
import { SaveTenantInfoDto } from './dto/save-tenant-info.dto';
import { FindTenantUserDto } from './dto/find-tenant-usr.dto';
import { AddTenantUserDto } from './dto/add-tenant-user.dto';
import { DeleteTenantUserDto } from './dto/delete-tenant-user.dto';
import { excludeFun } from 'src/utils/prisma';
import { ListVo } from 'src/common/vo/list.vo';
import { MinioService } from 'src/minio/minio.service';
import { UpdateTenantInfoDto } from './dto/update-tenant-info.dto';

@Injectable()
export class TenantService {

  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(MinioService)
  private readonly minioService: MinioService;

  /**
   * 创建项目
   * @param createTenantDto
   * @returns
   */
  async create(createTenantDto: CreateTenantDto) {
    const userInfo = this.cls.get('headers').user as User;
    const user = await this.prisma.user.findFirst({
      where: {
        userName: createTenantDto.userName,
      },
    });
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        companyName: createTenantDto.companyName,
      },
    });
    if (tenant) {
      throw new BadRequestException('项目名称已存在');
    }
    if (user) {
      throw new BadRequestException('用户名已存在');
    }
    const craetedTenant = await this.prisma.tenant.create({
      data: {
        contactUserName: createTenantDto.contactUserName,
        contactPhone: createTenantDto.contactPhone,
        companyName: createTenantDto.companyName,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
        users: {
          create: [
            {
              user: {
                create: {
                  userName: createTenantDto.userName,
                  password: md5(createTenantDto.password),
                  userType: USER_TYPE.PROJECT_ADMIN,
                  nickName: '项目管理员',
                  createBy: 'system',
                  updateBy: 'system',
                },
              },
            },
          ],
        },
        tenantPackage: {
          connect: {
            id: createTenantDto.tenantPackageId,
          },
        },
      },
    });
    const userToUpdate = await this.prisma.user.findFirst({
      where: {
        userName: createTenantDto.userName,
      },
    });
    if (!userToUpdate) {
      throw new NotFoundException('找不到用户');
    }
    await this.prisma.user.update({
      where: { id: userToUpdate.id },
      data: { defaultProjectId: craetedTenant.id },
    });

    return craetedTenant;
  }

  /**
   * 获取项目列表
   * @param findTenantListDto
   */
  async getList(findTenantListDto: FindTenantListDto) {
    const userInfo = this.cls.get('headers').user;
    const { current, pageSize, companyName, contactUserName, status } = findTenantListDto;

    const condition = {
      ...(companyName && { companyName: { contains: companyName } }),
      ...(contactUserName && {
        contactUserName: { contains: contactUserName },
      }),
      ...(status && { status }),
      deleteflag: 0,
    };

    if (userInfo.userType !== USER_TYPE.SYSTEM_USER) {
      condition['id'] = { in: userInfo.tenants.map((item) => item.tenantId) };
    }

    const list = await this.prisma.tenant.findMany({
      where: condition,
      include: { tenantPackage: true, companyDept: { where: { deleteflag: 0 } } },
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    const tenantListVo = new ListVo();

    // 转换
    const userIdsSet = new Set<number>();
    list.forEach((item) => {
      if (item.manager) userIdsSet.add(item.manager);
      if (item.chiefEngineer) userIdsSet.add(item.chiefEngineer);
      if (item.safetyDirector) userIdsSet.add(item.safetyDirector);
      if (item.areaLeader) userIdsSet.add(item.areaLeader);
    });
    const userIds = Array.from(userIdsSet);
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
    });

    tenantListVo.results = list.map((item) => {
      const { manager, chiefEngineer, areaLeader, safetyDirector, ...other } = item;
      const obj = {
        manager: manager ? users.find((user) => user.id === manager).nickName : null,
        chiefEngineer: chiefEngineer ? users.find((user) => user.id === chiefEngineer).nickName : null,
        safetyDirector: safetyDirector ? users.find((user) => user.id === safetyDirector).nickName : null,
        areaLeader: areaLeader ? users.find((user) => user.id === areaLeader).nickName : null,
        ...other,
      };
      return obj;
    });
    tenantListVo.total = await this.prisma.tenant.count({ where: condition });
    tenantListVo.current = current;
    tenantListVo.pageSize = pageSize;

    return tenantListVo;
  }

  /**
   * 禁用用户
   * @param forbiddenTenantDto
   */
  async forbidden(forbiddenTenantDto: ForbiddenTenantDto) {
    const userInfo = this.cls.get('headers').user as User;
    try {
      return await this.prisma.tenant.update({
        where: { id: forbiddenTenantDto.id },
        data: {
          status: forbiddenTenantDto.status,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException('禁用失败');
    }
  }

  /**
   * 根据ID查看项目信息
   * @param id
   */
  async getOne(id: number) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  /**
   * 更新项目
   * @param updateTenantDto
   */
  async updateTenant(updateTenantDto: UpdateTenantDto) {
    const userInfo = this.cls.get('headers').user as User;
    try {
      return await this.prisma.tenant.update({
        where: { id: updateTenantDto.id },
        data: {
          companyName: updateTenantDto.companyName,
          contactUserName: updateTenantDto.contactUserName,
          contactPhone: updateTenantDto.contactPhone,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException('更新失败');
    }
  }

  /**
   * 删除项目
   * @param id 项目ID
   */
  async deleteTenant(id: number) {
    try {
      return await this.prisma.tenant.update({
        where: { id },
        data: {
          deleteflag: 1,
        },
      });
    } catch (error) {
      throw new BadRequestException('删除失败');
    }
  }

  /**
   * 保存项目信息
   * @param saveTenantInfoDto
   */
  async saveTenantInfo(saveTenantInfoDto: SaveTenantInfoDto) {
    const tenantInfo = await this.prisma.tenant.update({
      where: { id: saveTenantInfoDto.id },
      data: {
        companyName: saveTenantInfoDto.companyName,
        projectName: saveTenantInfoDto.projectName,
        projectAddress: saveTenantInfoDto.projectAddress,
        manager: saveTenantInfoDto.manager,
        chiefEngineer: saveTenantInfoDto.chiefEngineer,
        developmentOrganization: saveTenantInfoDto.developmentOrganization,
        designOrganization: saveTenantInfoDto.designOrganization,
        supervisorOrganization: saveTenantInfoDto.supervisorOrganization,
        safetyDirector: saveTenantInfoDto.safetyDirector,
        developContact: saveTenantInfoDto.developContact,
        developAddress: saveTenantInfoDto.developAddress,
        developTel: saveTenantInfoDto.developTel,
        designContact: saveTenantInfoDto.designContact,
        designAddress: saveTenantInfoDto.designAddress,
        designTel: saveTenantInfoDto.designTel,
        supervisorContact: saveTenantInfoDto.supervisorContact,
        supervisorAddress: saveTenantInfoDto.supervisorAddress,
        supervisorTel: saveTenantInfoDto.supervisorTel,
        companyDeptId: saveTenantInfoDto.companyDeptId,
        startDate: saveTenantInfoDto.startDate,
        endDate: saveTenantInfoDto.endDate,
        projectNature: JSON.stringify(saveTenantInfoDto.projectNature),
        contactUserName: saveTenantInfoDto.contactUserName,
        contactPhone: saveTenantInfoDto.contactPhone,
        projectLocation: saveTenantInfoDto.projectLocation,
        area: saveTenantInfoDto.area,
        areaLeader: saveTenantInfoDto.areaLeader,
        projectType: saveTenantInfoDto.projectType,
        projectProfessional:
          saveTenantInfoDto.projectProfessional.length > 0 ? JSON.stringify(saveTenantInfoDto.projectProfessional) : '',
      },
    });

    // 给当前项目的项目管理员添加所属机构
    const users = await this.prisma.tenantsOnUsers.findMany({
      where: { tenantId: saveTenantInfoDto.id },
      include: {
        user: true,
      },
    });
    const filterUser = users.filter(
      (item) => item.user.userType === USER_TYPE.PROJECT_ADMIN && !item.user.companyDeptId,
    );
    if (filterUser.length > 0) {
      await this.prisma.user.updateMany({
        where: { id: { in: filterUser.map((item) => item.user.id) } },
        data: { companyDeptId: saveTenantInfoDto.companyDeptId },
      });
    }
    return tenantInfo;
  }

  /**
   * 获取项目信息
   * @param tenantId
   */
  async getTenantInfo(tenantId: number) {
    if (!tenantId) {
      throw new BadRequestException('没有选择项目,请退出后重新登录');
    }
    const data = await this.prisma.tenant.findFirst({
      where: { id: tenantId },
    });

    if (data) {
      const personnel = [data.manager, data.chiefEngineer, data.safetyDirector].filter((id) => id);
      if (personnel.length === 0) return data;
      const personelData = await this.prisma.user.findMany({
        where: {
          id: {
            in: personnel,
          },
        },
      });
      const personnelMap = new Map();
      personnel.forEach((item) => {
        personnelMap.set(
          item,
          personelData.find((data) => data.id === item),
        );
      });

      data.projectNature = data.projectNature ? JSON.parse(data.projectNature) : '';
      data.projectProfessional = data.projectProfessional ? JSON.parse(data.projectProfessional) : '';
      data.manager = personnelMap.get(data.manager).nickName;
      data.chiefEngineer = personnelMap.get(data.chiefEngineer).nickName;
      data.safetyDirector = personnelMap.get(data.safetyDirector).nickName;
    }

    return data;
  }

  /**
   * 获取项目的用户列表
   * @param tenantId
   */
  async getTenantUser(findTenantUserDto: FindTenantUserDto) {
    const { current, pageSize, tenantId } = findTenantUserDto;

    const list = await this.prisma.tenantsOnUsers.findMany({
      where: { tenantId: tenantId, user: { deleteflag: 0 } },
      include: {
        user: {
          include: { CompanyDept: { where: { deleteflag: 0 } }, roles: { include: { role: true } } },
        },
      },
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list.map((item) => excludeFun(item.user, ['password'])).map(item => {
        return {
          ...item,
          roleName: item.roles.map(role => role.role.roleName).join('、'),
        }
      }),
      current,
      pageSize,
      total: await this.prisma.tenantsOnUsers.count({
        where: { tenantId: tenantId },
      }),
    };
  }

  /**
   * 添加用户
   * @param addTenantUserDto
   */
  async addTenantUser(addTenantUserDto: AddTenantUserDto) {
    const { tenantId, userIds } = addTenantUserDto;
    //查询原有的用户
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId },
      include: { users: { include: { user: true } } },
    });
    const users = tenant.users.map((item) => item.user);
    const userIdsArr = tenant.users.map((item) => item.userId);
    const commonUserIds = userIds.filter((item) => userIdsArr.includes(item));
    if (commonUserIds.length > 0) {
      const nickName: string[] = [];
      commonUserIds.forEach((item) => {
        const user = users.find((user) => user.id === item);
        nickName.push(user.nickName);
      });
      throw new BadRequestException(`【${nickName.join()}】已经是该项目成员，请不要重复添加！`);
    }

    const createdUser = await this.prisma.tenantsOnUsers.createMany({
      data: [...userIds.map((item) => ({ tenantId: tenantId, userId: item }))],
    });
    await this.prisma.user.updateMany({
      where: { id: { in: userIds }, defaultProjectId: null },
      data: { defaultProjectId: tenantId },
    });
    return createdUser;
  }

  /**
   * 删除项目用户
   * @param deleteTenantUserDto
   */
  async deleteTenantUser(deleteTenantUserDto: DeleteTenantUserDto) {
    const userInfo = this.cls.get('headers').user as User;
    if (userInfo.id === deleteTenantUserDto.userId) {
      throw new BadRequestException('请不要删除自己！');
    }
    await this.prisma.tenantsOnUsers.delete({
      where: {
        userId_tenantId: {
          userId: deleteTenantUserDto.userId,
          tenantId: deleteTenantUserDto.tenantId,
        },
      },
    });
    await this.prisma.user.update({
      where: { id: deleteTenantUserDto.userId },
      data: { defaultProjectId: null },
    });
  }

  /**
   * 上传合同
   * @param tenantId
   * @param fileUrl
   */
  async uploadContract(tenantId: number, fileUrl: string, fileName: string) {
    return await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { contractUrl: fileUrl, contract: fileName },
    });
  }

  /**
   * 获取预览地址
   * @param fileName
   */
  async getContractPreview(fileName: string) {
    return await this.minioService.getPrivatPreviewUrl(fileName);
  }

  /**
   * 修改项目信息
   * @param updateTenantInfoDto 
   */
  async updateTenantInfo(updateTenantInfoDto: UpdateTenantInfoDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    await this.prisma.tenant.update({
      where: {id: tenantId},
      data: {...updateTenantInfoDto}
    })
  }
}
