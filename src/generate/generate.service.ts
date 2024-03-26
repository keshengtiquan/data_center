import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGenBasicDto } from './dto/create-generate.dto';
import { ClsService } from 'nestjs-cls';
import { User } from '@prisma/client';
import { BasiceFindListDto } from './dto/basice-find-list.dto';
import { sqlToTs } from 'src/utils/data';

@Injectable()
export class GenerateService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async getTables() {
    const list: any[] = await this.prisma.$queryRaw`SELECT
    table_name dbTable,
    table_comment comment
    FROM
    information_schema.TABLES
    WHERE
    table_schema = 'pinrun_data_center'
    ORDER BY
    table_name`;

    return list.filter((item) => !item.dbTable.startsWith('_'));
  }

  /**
   * 获取表的字段及注释
   * @param tableName
   */
  async getTableColumns(tableName: string) {
    const list: any[] = await this.prisma
      .$queryRaw`SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type, COLUMN_COMMENT AS comment
      FROM information_schema.columns
      WHERE table_schema = 'pinrun_data_center' AND table_name = ${tableName}
      ORDER BY
        CASE
          WHEN COLUMN_NAME = 'id' THEN 1
          WHEN COLUMN_NAME = 'delete_flag' THEN 4
          WHEN COLUMN_NAME IN ('create_by', 'update_by', 'create_time', 'update_time') THEN 3
          ELSE 2
        END,
        COLUMN_NAME;`;
    return list;
  }

  /**
   * 创建基础信息
   * @param createGenBasicDto
   */
  async editBasice(createGenBasicDto: CreateGenBasicDto) {
    const userInfo = this.cls.get('headers').user as User;
    const { id, ...other } = createGenBasicDto;
    if (id) {
      return await this.prisma.genBasic.update({
        where: { id },
        data: {
          ...other,
          updateBy: userInfo.userName,
        },
      });
    } else {
      const toCommonFieldEstimate = (
        fieldName: string,
        defaultValue: boolean,
      ) => {
        if (
          fieldName.indexOf('create_by') > -1 ||
          fieldName.indexOf('update_by') > -1 ||
          fieldName.indexOf('create_time') > -1 ||
          fieldName.indexOf('update_time') > -1
        ) {
          return defaultValue;
        }
      };
      const toCommonFieldDefaultValue = (
        fieldName: string,
        defaultValue: boolean,
      ) => {
        if (
          fieldName.indexOf('create_by') > -1 ||
          fieldName.indexOf('update_by') > -1 ||
          fieldName.indexOf('create_time') > -1 ||
          fieldName.indexOf('update_time') > -1
        ) {
          return !defaultValue;
        }
        return defaultValue;
      };
      return this.prisma.$transaction(async (tx) => {
        const data = await tx.genBasic.create({
          data: {
            ...other,
            createBy: userInfo.userName,
            updateBy: userInfo.userName,
          },
        });
        const tableColumns = await this.getTableColumns(data.dbTable);
        const createData = tableColumns.map((item, index) => {
          return {
            basicId: data.id,
            isTableKey: item.column_name === data.dbTableKey ? true : false,
            fieldName: item.column_name,
            fieldRemark: item.comment,
            fieldType: item.data_type,
            fieldTsType: sqlToTs(item.data_type),
            effectType: item.data_type === 'datetime' ? 'datepicker' : 'input',
            whetherTable: toCommonFieldDefaultValue(item.column_name, true),
            whetherRet: toCommonFieldEstimate(item.column_name, false),
            whetherAdd: toCommonFieldDefaultValue(item.column_name, true),
            whetherEdit: toCommonFieldDefaultValue(item.column_name, true),
            whetherReq: toCommonFieldEstimate(item.column_name, false),
            queryWheth: toCommonFieldEstimate(item.column_name, false),
            sortNumber: index + 1,
            createBy: userInfo.userName,
            updateBy: userInfo.userName,
          };
        });
        await tx.genConfig.createMany({
          data: createData,
        });
        return data;
      });
    }
  }

  /**
   * 查询列表
   */
  async getBasicList(basiceFindListDto: BasiceFindListDto) {
    const { pageSize, current } = basiceFindListDto;
    const list = await this.prisma.genBasic.findMany({
      where: {
        deleteflag: 0,
      },
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    return {
      results: list,
      current,
      pageSize,
      total: await this.prisma.genBasic.count({ where: { deleteflag: 0 } }),
    };
  }

  /**
   * 获取基础信息
   * @param id
   */
  async getBasic(id: number) {
    return this.prisma.genBasic.findUnique({
      where: { id },
    });
  }

  /**
   * 获取配置信息列表
   * @param basicId
   */
  async getConfigList(basicId: number) {
    const list = await this.prisma.genConfig.findMany({
      where: {
        basicId: basicId,
        deleteflag: 0,
      },
    });
    return list.filter((item) => item.fieldName !== 'delete_flag');
  }
}
