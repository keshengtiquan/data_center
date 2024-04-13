import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGenBasicDto } from './dto/create-generate.dto';
import { ClsService } from 'nestjs-cls';
import { GenConfig, User } from '@prisma/client';
import { BasiceFindListDto } from './dto/basice-find-list.dto';
import { sqlToTs, toCamelCase } from 'src/utils/data';
import Handlebars from 'handlebars';
import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';
import * as helpers from 'handlebars-helpers';
helpers.comparison({ handlebars: Handlebars });

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
      ORDER BY 'sort_number' asc`;
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
      const toCommonFieldEstimate = (fieldName: string, defaultValue: boolean) => {
        if (
          fieldName.indexOf('createBy') > -1 ||
          fieldName.indexOf('updateBy') > -1 ||
          fieldName.indexOf('createTime') > -1 ||
          fieldName.indexOf('updateTime') > -1
        ) {
          return defaultValue;
        }
      };
      const toCommonFieldDefaultValue = (fieldName: string, defaultValue: boolean) => {
        if (
          fieldName.indexOf('createBy') > -1 ||
          fieldName.indexOf('updateBy') > -1 ||
          fieldName.indexOf('createTime') > -1 ||
          fieldName.indexOf('updateTime') > -1
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
            fieldName: toCamelCase(item.column_name),
            fieldRemark: item.comment,
            fieldType: item.data_type,
            fieldTsType: sqlToTs(item.data_type),
            effectType: item.data_type === 'datetime' ? 'datepicker' : 'input',
            whetherTable: toCommonFieldDefaultValue(item.column_name, true),
            whetherRet: toCommonFieldEstimate(item.column_name, false),
            whetherAdd: toCommonFieldDefaultValue(item.column_name, false),
            whetherEdit: toCommonFieldDefaultValue(item.column_name, false),
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
      orderBy: {
        createTime: 'desc',
      }
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
      orderBy: {sortNumber: 'asc'}
    });
    return list.filter((item) => item.fieldName !== 'delete_flag');
  }

  /**
   * 保存配置信息
   * @param tableData
   */
  async saveConfig(tableData: GenConfig[]) {
    const userInfo = this.cls.get('headers').user as User;
    const updates = [];
    tableData.forEach((item) => {
      updates.push(
        this.prisma.genConfig.update({
          where: { id: item.id },
          data: {
            fieldRemark: item.fieldRemark,
            effectType: item.effectType,
            dictTypeCo: item.dictTypeCo,
            whetherTable: item.whetherTable,
            whetherRet: item.whetherRet,
            whetherAdd: item.whetherAdd,
            whetherEdit: item.whetherEdit,
            whetherReq: item.whetherReq,
            queryWheth: item.queryWheth,
            queryType: item.queryType,
            updateBy: userInfo.userName,
          },
        }),
      );
    });
    return await Promise.all(updates);
  }

  /**
   * 生成代码
   * @param id
   */
  async generateTem(id: number) {
    const basicData = await this.prisma.genBasic.findUnique({
      where: { id },
    });
    const configData = await this.prisma.genConfig.findMany({
      where: { basicId: id, deleteflag: 0 },
    });

    const genData = {
      moduleName: basicData.moduleName,
      uppermoduleName: basicData.moduleName.charAt(0).toUpperCase() + basicData.moduleName.slice(1),
      busName: basicData.busName,
      addColumns: configData.filter((item) => item.whetherAdd),
      searchColumns: configData.filter((item) => item.queryWheth),
    };

    return this.genCodeZip(genData);
  }

  /**
   * 预览代码
   * @param id
   */
  async previewCode(id: number) {
    const basicData = await this.prisma.genBasic.findUnique({
      where: { id },
    });
    const configData = await this.prisma.genConfig.findMany({
      where: { basicId: id, deleteflag: 0 },
    });
    const genData = {
      moduleName: basicData.moduleName,
      uppermoduleName: basicData.moduleName.charAt(0).toUpperCase() + basicData.moduleName.slice(1),
      busName: basicData.busName,
      addColumns: configData.filter((item) => item.whetherAdd && item.fieldName !== 'delete_flag'),
      editColumns: configData.filter((item) => item.whetherEdit && item.fieldName !== 'delete_flag'),
      addAndEditColumns: configData.filter(
        (item) => item.fieldName !== 'delete_flag' && (item.whetherAdd || item.whetherEdit),
      ),
      searchColumns: configData.filter((item) => item.queryWheth),
      formLayout: basicData.formLayout,
      gridWhether: basicData.gridWhether,
      allColumns: configData,
      tableColumns: configData.filter((item) => item.fieldName !== 'delete_flag'),
    };
    return this.genPreviewCode(genData);
  }

  /**
   * 预览代码
   * @param genData
   * @returns
   */
  async genPreviewCode(genData: any) {
    const [controller, service, module, createDto, updateDto, findListDto, form, api, createModal, updateModal, table] =
      await this.generateFiles(genData);

    return {
      genBasicCodeBackendResultList: [
        {
          codeFileName: `${genData.moduleName}.controller.ts`,
          language: 'javascript',
          codeFileContent: controller,
        },
        {
          codeFileName: `${genData.moduleName}.service.ts`,
          language: 'javascript',
          codeFileContent: service,
        },
        {
          codeFileName: `${genData.moduleName}.module.ts`,
          language: 'javascript',
          codeFileContent: module,
        },
        {
          codeFileName: `create-${genData.moduleName}.dto.ts`,
          language: 'javascript',
          codeFileContent: createDto,
        },
        {
          codeFileName: `update-${genData.moduleName}.dto.ts`,
          language: 'javascript',
          codeFileContent: updateDto,
        },
        {
          codeFileName: `find-${genData.moduleName}-list.dto.ts`,
          language: 'javascript',
          codeFileContent: findListDto,
        },
      ],
      genBasicCodeFrontendResultList: [
        {
          codeFileName: `${genData.moduleName}-form.vue`,
          language: 'html',
          codeFileContent: form,
        },
        {
          codeFileName: 'index.ts',
          language: 'typescript',
          codeFileContent: api,
        },
        {
          codeFileName: `create-${genData.moduleName}-modal.vue`,
          language: 'html',
          codeFileContent: createModal,
        },
        {
          codeFileName: `update-${genData.moduleName}-modal.vue`,
          language: 'html',
          codeFileContent: updateModal,
        },
        {
          codeFileName: 'index.vue',
          language: 'html',
          codeFileContent: table,
        },
      ],
    };
  }

  /**
   * 生成代码
   * @param genData
   * @returns
   */
  async genCodeZip(genData: any) {
    const output = fs.createWriteStream('generated-code.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    output.on('end', function () {
      console.log('Data has been drained');
    });
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });
    archive.on('error', function (err) {
      throw err;
    });
    archive.pipe(output);

    const [controller, service, module, createDto, updateDto, findListDto, form, api, createModal, updateModal, table] =
      await this.generateFiles(genData);

    archive.append(controller, {
      name: `backend/${genData.moduleName}.controller.ts`,
    });
    archive.append(service, {
      name: `backend/${genData.moduleName}.service.ts`,
    });
    archive.append(module, {
      name: `backend/${genData.moduleName}.module.ts`,
    });
    archive.append(createDto, {
      name: `backend/dto/create-${genData.moduleName}.dto.ts`,
    });
    archive.append(updateDto, {
      name: `backend/dto/update-${genData.moduleName}.dto.ts`,
    });
    archive.append(findListDto, {
      name: `backend/dto/find-${genData.moduleName}-list.dto.ts`,
    });
    archive.append(form, {
      name: `front/component/${genData.moduleName}-form.vue`,
    });
    archive.append(createModal, {
      name: `front/component/create-${genData.moduleName}-modal.vue`,
    });
    archive.append(updateModal, {
      name: `front/component/update-${genData.moduleName}-modal.vue`,
    });
    archive.append(table, {
      name: `front/index.vue`,
    });
    archive.append(api, {
      name: `front/api/${genData.moduleName}/index.ts`,
    });
    await archive.finalize();
    return 'generated-code.zip';
  }

  async generateFiles(genData: any) {
    //key要和模版的文件名一致
    const templatePaths = {
      controller: '/tem/controller.hbs',
      service: '/tem/service.hbs',
      module: '/tem/module.hbs',
      createDto: '/tem/createDto.hbs',
      updateDto: '/tem/updateDto.hbs',
      findListDto: '/tem/findListDto.hbs',
      form: '/tem/form.hbs',
      api: '/tem/api.hbs',
      createModal: '/tem/createModal.hbs',
      updateModal: '/tem/updateModal.hbs',
      table: '/tem/table.hbs',
    };

    const filePromises = Object.keys(templatePaths).map(async (key) => {
      const filePath = path.join(__dirname, templatePaths[key]);
      const fileTem = fs.readFileSync(filePath);
      const fileTemplate = Handlebars.compile(fileTem.toString());
      return fileTemplate(genData);
    });

    return Promise.all(filePromises);
  }
}
