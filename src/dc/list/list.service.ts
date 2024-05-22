import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindListListDto } from './dto/find-list-list.dto';
import { ExcelService, HeaderDataType } from 'src/excel/excel.service';
import Decimal from 'decimal.js';
import { ExportListDto } from './dto/export-list.dto';

@Injectable()
export class ListService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(ExcelService)
  private readonly excelService: ExcelService;

  private readonly excelTableHeader: HeaderDataType[] = [
    { col: 'A', width: 10, key: 'serialNumber', header: '序号' },
    { col: 'B', width: 20, key: 'listCode', header: '项目编码' },
    { col: 'C', width: 25, key: 'listName', header: '项目名称*' },
    { col: 'D', width: 30, key: 'listCharacteristic', header: '项目特征' },
    { col: 'E', width: 15, key: 'unit', header: '单位*' },
    { col: 'F', width: 20, key: 'quantities', header: '工程量*' },
    { col: 'G', width: 20, key: 'unitPrice', header: '单价*' },
    { col: 'H', width: 20, key: 'combinedPrice', header: '合价*' },
    { col: 'I', width: 20, key: 'divisionName', header: '所属分项' },
  ];

  /**
   * 创建清单
   * @param createListDto
   * @returns
   */
  async create(createListDto: CreateListDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const list = await this.prisma.list.findFirst({
      where: {
        listCode: createListDto.listCode,
        tenantId: tenantId,
        deleteflag: 0
      }
    })
    if(list) {
      throw new BadRequestException('清单编码已存在')
    }
    return this.prisma.$transaction(async (prisma) => {
      const list = await prisma.list.create({
        data: {
          combinedPrice: createListDto.combinedPrice,
          listCharacteristic: createListDto.listCharacteristic,
          listCode: createListDto.listCode,
          listName: createListDto.listName,
          quantities: createListDto.quantities,
          serialNumber: createListDto.serialNumber,
          unit: createListDto.unit,
          unitPrice: createListDto.unitPrice,
          tenantId: tenantId,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
      // excel 导入时使用
      if (createListDto.divisionName) {
        const division = await this.prisma.division.findFirst({
          where: {
            divisionName: createListDto.divisionName,
          },
        });
        if (!division) {
          throw new BadRequestException('分部分项不存在');
        }
        await prisma.list.update({
          where: { id: list.id },
          data: {
            currentSection: division.id,
            sectionalEntry: division.parentNames,
          },
        });
      }
      return list;
    });
  }

  /**
   * 查询清单列表
   * @param FindListListDto
   * @returns
   */
  async findAll(findListListDto: FindListListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const {
      current,
      pageSize,
      listCharacteristic,
      listCode,
      listName,
      sectionalEntry,
      notDivision,
      workPlaceIdExclude,
    } = findListListDto;
    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      ...(sectionalEntry && { sectionalEntry: { contains: String(sectionalEntry) } }), //分部分项下的清单
      ...(notDivision && { currentSection: null }), //不分部分项下的清单
      // ...(ids && { id: { in: ids } }), // 查询指定清单
      tenantId,
      deleteflag: 0,
    };

    // 查询工点下没有分配的清单
    if (workPlaceIdExclude) {
      const workPlace = await this.prisma.workPlace.findUnique({
        where: { id: workPlaceIdExclude },
        include: {
          WorkPlaceList: {
            where: {
              deleteflag: 0,
            },
          },
        },
      });
      const listIds = workPlace.WorkPlaceList.map((item) => item.listId);
      condition['id'] = { notIn: listIds };
    }

    const list = await this.prisma.list.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.list.count({ where: condition }),
    };
  }

  /**
   * 根据ID查询清单
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.list.findUnique({
      where: { id },
    });
  }

  /**
   * 更新清单
   * @param id
   * @returns
   */
  async update(updateListDto: UpdateListDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.list.update({
      where: { id: updateListDto.id },
      data: {
        combinedPrice: updateListDto.combinedPrice,
        listCharacteristic: updateListDto.listCharacteristic,
        listCode: updateListDto.listCode,
        listName: updateListDto.listName,
        quantities: updateListDto.quantities,
        serialNumber: updateListDto.serialNumber,
        unit: updateListDto.unit,
        unitPrice: updateListDto.unitPrice,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除清单
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.list.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除清单
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.list.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 导入清单模版
   */
  async exportListTemplate() {
    const fillInstructions =
      '填写说明: \n1. 带*的为必填项。' +
      '\n2. 导入文件时不要删除此说明 ' +
      '\n3. 工程量、单价、合价请填写数字(小数保留两位小数)，单位为元。' +
      '\n4. 所属分项为已导入的分部分项工程名称。';
    return await this.excelService.exportTableHeader({
      tableHeader: this.excelTableHeader,
      sheetName: '清单导入模版',
      fillInstructions,
    });
  }

  /**
   * 导入清单
   * @param file
   */
  async importListFile(file: Express.Multer.File) {
    const rows = await this.excelService.parseExcel(file, '清单导入模版', 3, this.excelTableHeader);

    let errorCount = 0;
    const errorDetail = [];
    let successCount = 0;
    for (const row of rows) {
      row.unitPrice = row.unitPrice ? Number(row.unitPrice) : 0;
      row.combinedPrice = row.combinedPrice ? Number(row.combinedPrice) : 0;

      const errorMessage = this.validateTableData(row);
      if (errorMessage.length > 0) {
        errorDetail.push({
          index: row.rowNumber,
          msg: errorMessage.join(','),
          success: false,
        });
        errorCount++;
        continue;
      }
      try {
        await this.create(row);
        successCount++;
      } catch (error) {
        errorCount++;
        errorDetail.push({
          index: row.rowNumber,
          msg: error.message,
          success: false,
        });
      }
    }
    return {
      totalCount: rows.length,
      errorCount,
      errorDetail,
      successCount,
    };
  }

  /**
   * 导出清单
   * @param exportListDto
   */
  async exportList(exportListDto: ExportListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, ids, listCharacteristic, listCode, listName, sectionalEntry } = exportListDto;
    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      ...(sectionalEntry && { sectionalEntry: { contains: String(sectionalEntry) } }), //分部分项下的清单
      ...(ids && { id: { in: ids } }), // 查询指定清单
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.list.findMany({
      where: condition,
      skip: current && (current - 1) * pageSize,
      take: pageSize && pageSize,
    });
    const customStyle = [
      {
        // 从0开始
        columnIndex: 3,
        alignment: {
          wrapText: true,
          vertical: 'middle',
          horizontal: 'left',
        },
      },
    ];
    return await this.excelService.exportExcelFile({
      sheetName: '清单列表',
      tableData: list.map((item) => {
        const { unitPrice, combinedPrice, ...other } = item;
        return {
          unitPrice: unitPrice.toNumber(),
          combinedPrice: combinedPrice.toNumber(),
          ...other,
        };
      }),
      tableHeader: this.excelTableHeader.slice(0, this.excelTableHeader.length - 1),
      customStyle,
    });
  }

  validateTableData(row: CreateListDto) {
    const { listName, unit, quantities, unitPrice, combinedPrice } = row;
    const message: string[] = [];
    if (!listName) {
      message.push(`项目名称不能为空`);
    }
    if (!unit) {
      message.push(`单位不能为空`);
    }
    if (!quantities) {
      message.push(`工程量不能为空`);
    }
    if (!unitPrice) {
      message.push(`单价不能为空`);
    }
    if (!combinedPrice) {
      message.push(`合价不能为空`);
    }
    if (
      quantities &&
      unitPrice &&
      combinedPrice &&
      Decimal.mul(quantities, unitPrice).toDP(2, Decimal.ROUND_HALF_UP).toNumber() !== Number(combinedPrice)
    ) {
      message.push(
        `${quantities} * ${unitPrice} = ${Decimal.mul(quantities, unitPrice).toNumber()}与导入的${Number(
          combinedPrice,
        )}不等`,
      );
    }
    return message;
  }
}
