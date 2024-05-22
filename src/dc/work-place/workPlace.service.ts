import { Injectable, Inject, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { CreateWorkPlaceDto } from './dto/create-workPlace.dto';
import { UpdateWorkPlaceDto } from './dto/update-workPlace.dto';
import { FindWorkPlaceListDto } from './dto/find-workPlace-list.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma1/prisma.service';
import { ClsService } from 'nestjs-cls';
import { FindWorkPlaceListListDto } from './dto/find-workPlaceList-list.dto';
import Decimal from 'decimal.js';
import { SaveWorkPlaceListQuantities } from './dto/save-workPlace-quantity.dto';
import { FindWorkPlaceListCollectionDto } from './dto/find-workplace-list-collection.dto';
import { ExcelService, HeaderDataType } from 'src/excel/excel.service';
import { UpdateWorkPlacePositionDto } from './dto/update-workplace-positon.dto';
import { ExportWorkPlaceListDto } from './dto/export-workPlace-list.dto';
import { WorkPlaceType } from 'src/common/enum';
import { objectDeleteNull } from 'src/utils/data';

@Injectable()
export class WorkPlaceService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(ExcelService)
  private readonly excelService: ExcelService;

  private readonly workPlaceListExcelTableHeader: HeaderDataType[] = [
    { col: 'A', width: 10, key: 'sortNumber', header: '排序' },
    { col: 'B', width: 20, key: 'workPlaceCode', header: '工点编码' },
    { col: 'C', width: 25, key: 'workPlaceName', header: '工点名称*' },
    { col: 'D', width: 30, key: 'workPlaceType', header: '工点类型' },
  ];

  private readonly workPlaceExcelTableHeader: HeaderDataType[] = [
    { col: 'A', width: 20, key: 'listCode', header: '项目编码*' },
    { col: 'B', width: 20, key: 'listName', header: '项目名称*' },
    { col: 'C', width: 25, key: 'listCharacteristic', header: '项目特征' },
    { col: 'D', width: 30, key: 'unit', header: '单位' },
    { col: 'E', width: 30, key: 'allQuantities', header: '工程量*' },
    { col: 'F', width: 30, key: 'leftQuantities', header: '左线工程量' },
    { col: 'G', width: 30, key: 'rightQuantities', header: '右线工程量' },
  ];

  private collectionTableHeader: HeaderDataType[] = [
    { col: 'A', key: 'serialNumber', header: '序号', width: 10 },
    { col: 'B', key: 'listCode', header: '项目编码', width: 16 },
    { col: 'C', key: 'listName', header: '项目名称', width: 20 },
    { col: 'D', key: 'listCharacteristic', header: '项目特征', width: 20 },
    { col: 'E', key: 'unit', header: '单位', width: 10 },
    { col: 'F', key: 'unitPrice', header: '单价', width: 10 },
    { col: 'G', key: 'quantities', header: '工程量', width: 10 },
    { col: 'H', key: 'total', header: '合计', width: 10 },
  ];

  /**
   * 创建工点
   * @param createWorkPlaceDto
   * @returns
   */
  async create(createWorkPlaceDto: CreateWorkPlaceDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    const find = await this.prisma.workPlace.findFirst({
      where: {
        workPlaceCode: createWorkPlaceDto.workPlaceCode,
        deleteflag: 0,
        tenantId,
      },
    });
    if (find) {
      throw new HttpException('工点编码已存在', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.workPlace.create({
        data: {
          tenantId: tenantId,
          workPlaceCode: createWorkPlaceDto.workPlaceCode,
          workPlaceName: createWorkPlaceDto.workPlaceName,
          workPlaceType: createWorkPlaceDto.workPlaceType,
          sortNumber: createWorkPlaceDto.sortNumber,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 查询工点列表
   * @param FindWorkPlaceListDto
   * @returns
   */
  async findAll(findWorkPlaceListDto: FindWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, workPlaceName, workPlaceType } = findWorkPlaceListDto;
    const condition = {
      ...(workPlaceName && { workPlaceName: { contains: workPlaceName } }),
      ...(workPlaceType && { workPlaceType: workPlaceType }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.workPlace.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: { sortNumber: 'asc' },
    });

    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.workPlace.count({ where: condition }),
    };
  }

  /**
   * 查询工点（无分页）
   * @param findWorkPlaceListDto
   */
  async findAllPaginationFree(findWorkPlaceListDto: FindWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { workPlaceName, workPlaceType } = findWorkPlaceListDto;
    const condition = {
      ...(workPlaceName && { workPlaceName: { contains: workPlaceName } }),
      ...(workPlaceType && { workPlaceType: workPlaceType }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.workPlace.findMany({
      where: condition,
      orderBy: { sortNumber: 'asc' },
    });
    return list;
  }

  /**
   * 根据ID查询工点
   * @param id
   * @returns
   */
  async findOne(id: number) {
    return await this.prisma.workPlace.findUnique({
      where: { id },
    });
  }

  /**
   * 更新工点
   * @param id
   * @returns
   */
  async update(updateWorkPlaceDto: UpdateWorkPlaceDto) {
    const userInfo = this.cls.get('headers').user as User;
    return await this.prisma.workPlace.update({
      where: { id: updateWorkPlaceDto.id },
      data: {
        workPlaceCode: updateWorkPlaceDto.workPlaceCode,
        workPlaceName: updateWorkPlaceDto.workPlaceName,
        workPlaceType: updateWorkPlaceDto.workPlaceType,
        sortNumber: updateWorkPlaceDto.sortNumber,
        updateBy: userInfo.userName,
      },
    });
  }

  /**
   * 删除工点
   * @param id
   * @returns
   */
  async remove(id: number) {
    return await this.prisma.workPlace.update({
      where: { id },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 批量删除工点
   * @param ids
   * @returns
   */
  async batchDelete(ids: number[]) {
    return await this.prisma.workPlace.updateMany({
      where: { id: { in: ids } },
      data: { deleteflag: 1 },
    });
  }

  /**
   * 关联清单
   * @param id
   */
  async relationList(workPlaceId: number, listIds: number[]) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const createData = listIds.map((item) => {
      return {
        tenantId,
        workPlaceId,
        listId: item,
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
      };
    });

    return await this.prisma.workPlaceList.createMany({
      data: createData,
    });
  }

  /**
   * 查询工点下的清单
   * @param workPlaceId
   */
  async workPlaceList(findWorkPlaceListListDto: FindWorkPlaceListListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, listCharacteristic, workPlaceId, listCode, listName } = findWorkPlaceListListDto;

    const workPlaceList = await this.prisma.workPlaceList.findMany({
      where: {
        tenantId,
        deleteflag: 0,
        workPlaceId,
      },
    });

    const listIds = workPlaceList.map((item) => item.listId);

    const condition = {
      ...(listCharacteristic && { listCharacteristic: { contains: listCharacteristic } }),
      ...(listCode && { listCode: { contains: listCode } }),
      ...(listName && { listName: { contains: listName } }),
      id: { in: listIds },
      tenantId,
      deleteflag: 0,
    };
    const listInfo = await this.prisma.list.findMany({
      where: condition,
      select: {
        id: true,
        listCode: true,
        serialNumber: true,
        listName: true,
        listCharacteristic: true,
        unit: true,
        unitPrice: true,
      },
    });

    const list = listInfo.map((list) => {
      const workPlace = workPlaceList.find((item) => item.listId === list.id);
      const { id, ...other } = list;
      const obj = {
        ...other,
        listId: id,
        allQuantities: null,
        leftQuantities: null,
        rightQuantities: null,
        combinedPrice: null,
      };
      if (workPlace) {
        obj['id'] = workPlace.id;
        obj.allQuantities = workPlace.allQuantities;
        obj.leftQuantities = workPlace.leftQuantities;
        obj.rightQuantities = workPlace.rightQuantities;
        if (workPlace.allQuantities) {
          obj.combinedPrice = Number(Decimal.mul(workPlace.allQuantities, list.unitPrice));
        }
      }
      return obj;
    });

    return {
      results: list,
      current,
      pageSize,
      total: 2,
    };
  }

  /**
   * 删除工点下的清单
   * @param id
   */
  async deleteWorkPlaceList(id: number) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    return await this.prisma.workPlaceList.update({
      where: { id: id, tenantId },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 批量删除工点下的清单
   * @param ids
   */
  async batchDeleteWorkPlaceList(ids: number[]) {
    await this.prisma.workPlaceList.updateMany({
      where: { id: { in: ids } },
      data: {
        deleteflag: 1,
      },
    });
  }

  /**
   * 保存工点工程量
   * @param saveWorkPlaceListQuantities
   */
  async saveWorkPlaceListQuantities(saveWorkPlaceListQuantities: SaveWorkPlaceListQuantities) {
    return await this.prisma.workPlaceList.update({
      where: { id: saveWorkPlaceListQuantities.id },
      data: {
        leftQuantities: saveWorkPlaceListQuantities.leftQuantities,
        rightQuantities: saveWorkPlaceListQuantities.rightQuantities,
        allQuantities: saveWorkPlaceListQuantities.allQuantities,
      },
    });
  }

  /**
   * 获取工点汇总表
   * @param findWorkPlaceListCollectionDto
   */
  async findWorkPlaceListCollection(findWorkPlaceListCollectionDto: FindWorkPlaceListCollectionDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, sectionalEntry } = findWorkPlaceListCollectionDto;
    const condition = {
      ...(sectionalEntry && { sectionalEntry: { contains: sectionalEntry } }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.list.findMany({
      where: condition,
      take: pageSize,
      skip: (current - 1) * pageSize,
    });

    const workPlace = await this.prisma.workPlace.findMany({
      where: { deleteflag: 0, tenantId },
      include: {
        WorkPlaceList: { where: { deleteflag: 0 } },
      },
    });
    const results = [];
    const workPlaceArr = [];
    workPlace.forEach((workPlace) => {
      if (workPlace.WorkPlaceList.length > 0) {
        workPlace.WorkPlaceList.forEach((item) => {
          const obj = {};
          obj['listId'] = item.listId;
          obj[`${workPlace.workPlaceCode}`] = {
            allQuantities: item.allQuantities,
            leftQuantities: item.leftQuantities,
            rightQuantities: item.rightQuantities,
          };
          workPlaceArr.push(obj);
        });
      }
    });

    list.forEach((list) => {
      const tem = workPlaceArr.filter((item) => item.listId === list.id);
      const obj = { ...list };
      let total = 0;
      if (tem.length > 0) {
        tem.forEach((item) => {
          delete item.listId;
          const key = Object.keys(item)[0];
          total += item[key].allQuantities;
          Object.assign(obj, item);
        });
      }
      obj['total'] = total;
      results.push(obj);
    });
    return {
      results: results,
      total: await this.prisma.list.count({ where: condition }),
      current,
      pageSize,
    };
  }

  /**
   * 工点导入模版
   */
  async exportWorkPlaceTemplate() {
    const fillInstructions = '填写说明: \n1. 带*的为必填项。' + '\n2. 导入文件时不要删除此说明 ';
    const select = [{ column: 'D', start: 3, end: 50, formulae: '"车站,区间"' }];
    return await this.excelService.exportTableHeader({
      tableHeader: this.workPlaceListExcelTableHeader,
      sheetName: '工点导入模版',
      fillInstructions,
      select,
    });
  }

  /**
   * 导入工点
   * @param file
   */
  async importWorkPlace(file: Express.Multer.File) {
    const rows = await this.excelService.parseExcel(file, '工点导入模版', 3, this.workPlaceListExcelTableHeader);
    // console.log(rows);
    let errorCount = 0;
    const errorDetail = [];
    let successCount = 0;

    for (const row of rows) {
      if (!row.workPlaceName) {
        errorCount++;
        errorDetail.push({
          index: row.rowNumber,
          msg: '工点名称不能为空',
          success: false,
        });
      } else if (row.workPlaceType !== '车站' && row.workPlaceType !== '区间') {
        errorCount++;
        errorDetail.push({
          index: row.rowNumber,
          msg: '工点类型只能为车站或区间',
          success: false,
        });
      } else {
        try {
          row.workPlaceType = row.workPlaceType === '车站' ? 'station' : 'section';
          await this.create(row);
          successCount++;
        } catch (error) {
          errorCount++;
          errorDetail.push({
            index: row.rowNumber,
            msg: error,
            success: false,
          });
        }
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
   * 修改工点的canvas位置
   * @param updateWorkPlacePositionDto
   */
  async updatePosition(updateWorkPlacePositionDto: UpdateWorkPlacePositionDto[]) {
    for (const workPlace of updateWorkPlacePositionDto) {
      await this.prisma.workPlace.update({
        where: { id: workPlace.id },
        data: {
          x: workPlace.x,
          y: workPlace.y,
        },
      });
    }
  }

  /**
   * 工点清单导入模版
   */
  async exportWorkPlaceListTemplate() {
    const fillInstructions =
      '填写说明: \n1. 带*的为必填项。' +
      '\n2. 导入文件时不要删除此说明 ' +
      '\n3. 导入区间清单时工程量应等于左线右线工程量之和';
    return await this.excelService.exportTableHeader({
      tableHeader: this.workPlaceExcelTableHeader,
      sheetName: '工点清单导入模版',
      fillInstructions,
    });
  }

  /**
   * 工点清单导入
   * @param file
   */
  async importWorkPlaceList(file: Express.Multer.File, workPlaceId: number) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const rows = await this.excelService.parseExcel(file, '工点清单导入模版', 3, this.workPlaceExcelTableHeader);
    let errorCount = 0;
    const errorDetail = [];
    let successCount = 0;

    rows.forEach((row) => {
      if (!row.listCode) {
        errorCount++;
        errorDetail.push({
          index: row.rowNumber,
          msg: '清单编号不能为空',
          success: false,
        });
      }
    });

    const listCodes = rows.filter((item) => item.listCode).map((item) => item.listCode);

    const lists = await this.prisma.list.findMany({
      where: {
        listCode: { in: listCodes },
        deleteflag: 0,
        tenantId,
      },
    });
    const listIds = lists.map((item) => item.id);
    await this.relationList(workPlaceId, listIds);

    for (const list of lists) {
      const workPlaceData = rows.find((item) => item.listCode === list.listCode);
      try {
        await this.prisma.workPlaceList.updateMany({
          where: { workPlaceId: workPlaceId, listId: list.id, tenantId, deleteflag: 0 },
          data: {
            leftQuantities: workPlaceData.leftQuantities,
            rightQuantities: workPlaceData.rightQuantities,
            allQuantities: workPlaceData.allQuantities,
          },
        });
        successCount++;
      } catch (error) {
        errorCount++;
        errorDetail.push({
          index: workPlaceData.rowNumber,
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
   * 导出汇总的清单
   * @param exportWorkPlaceListDto
   */
  async exportWorkPlaceListCollection(exportWorkPlaceListDto: ExportWorkPlaceListDto) {
    const margeTableHeder = this.collectionTableHeader.map((item) => item.header);
    const list = await this.exportWorkPlaceListCollectionData(exportWorkPlaceListDto);
    const workPlaceList = await this.findAllPaginationFree({});
    workPlaceList.forEach((workPlace) => {
      if (workPlace.workPlaceType === WorkPlaceType.STATION) {
        // { col: 'H', key: 'total', header: '合计', width: 10 },
        const col = {
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode,
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 3,
        };
        this.collectionTableHeader.push(col);
        margeTableHeder.push(workPlace.workPlaceName);
      } else if (workPlace.workPlaceType === WorkPlaceType.SECTION) {
        this.collectionTableHeader.push({
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode + '_left',
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 1.3,
        });
        margeTableHeder.push('左线');
        this.collectionTableHeader.push({
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode + '_right',
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 1.3,
        });
        margeTableHeder.push('右线');
      }
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
      tableHeader: this.collectionTableHeader,
      sheetName: '工点清单列表',
      mergeRowsData: [1],
      tableData: list.map((item) => {
        const keys = Object.keys(item);
        const workPlaceKeys = [];
        keys.forEach((key) => {
          if (workPlaceList.map((workPlace) => workPlace.workPlaceCode).includes(key)) {
            const work = workPlaceList.find((ele) => ele.workPlaceCode === key);
            workPlaceKeys.push({ key, type: work.workPlaceType });
          }
        });
        workPlaceKeys.forEach((ele) => {
          if (ele.type === WorkPlaceType.STATION) {
            item[ele.key] = item[ele.key].allQuantities;
          } else if (ele.type === WorkPlaceType.SECTION) {
            item[ele.key + '_left'] = item[ele.key].leftQuantities;
            item[ele.key + '_right'] = item[ele.key].rightQuantities;
          }
        });
        item.unitPrice = item.unitPrice.toNumber();
        return item;
      }),
      mergeColumnsData: {
        rowDatas: [margeTableHeder],
        megerColumnRanges: [[1, 2]],
      },
      customStyle,
    });
  }
  /**
   * 导出时查询汇总清单
   * @param exportWorkPlaceListDto
   * @returns
   */
  async exportWorkPlaceListCollectionData(exportWorkPlaceListDto: ExportWorkPlaceListDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const { current, pageSize, sectionalEntry } = exportWorkPlaceListDto;
    const condition = {
      ...(sectionalEntry && { sectionalEntry: { contains: sectionalEntry } }),
      tenantId,
      deleteflag: 0,
    };
    const list = await this.prisma.list.findMany({
      where: condition,
      take: pageSize && pageSize,
      skip: current && (current - 1) * pageSize,
    });

    const workPlace = await this.prisma.workPlace.findMany({
      where: { deleteflag: 0, tenantId },
      include: {
        WorkPlaceList: { where: { deleteflag: 0 } },
      },
    });
    const results = [];
    const workPlaceArr = [];
    workPlace.forEach((workPlace) => {
      if (workPlace.WorkPlaceList.length > 0) {
        workPlace.WorkPlaceList.forEach((item) => {
          const obj = {};
          obj['listId'] = item.listId;
          obj[`${workPlace.workPlaceCode}`] = {
            allQuantities: item.allQuantities,
            leftQuantities: item.leftQuantities,
            rightQuantities: item.rightQuantities,
          };
          workPlaceArr.push(obj);
        });
      }
    });

    list.forEach((list) => {
      const tem = workPlaceArr.filter((item) => item.listId === list.id);
      const obj = { ...list };
      let total = 0;
      if (tem.length > 0) {
        tem.forEach((item) => {
          delete item.listId;
          const key = Object.keys(item)[0];
          total += item[key].allQuantities;
          Object.assign(obj, item);
        });
      }
      obj['total'] = total;
      results.push(obj);
    });
    return results;
  }

  /**
   * 导入汇总清单
   * @param file
   */
  async importWorkPlaceListCollection(file: Express.Multer.File) {
    const workPlaceList = await this.findAllPaginationFree({});
    workPlaceList.forEach((workPlace) => {
      if (workPlace.workPlaceType === WorkPlaceType.STATION) {
        // { col: 'H', key: 'total', header: '合计', width: 10 },
        const col = {
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode,
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 3,
        };
        this.collectionTableHeader.push(col);
      } else if (workPlace.workPlaceType === WorkPlaceType.SECTION) {
        this.collectionTableHeader.push({
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode + '_left',
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 1.3,
        });
        this.collectionTableHeader.push({
          col: this.excelService.columnIndexToColumnLetter(this.collectionTableHeader.length + 1),
          key: workPlace.workPlaceCode + '_right',
          header: workPlace.workPlaceName,
          width: workPlace.workPlaceName.length * 1.3,
        });
      }
    });
    const rows = await this.excelService.parseExcel(file, '工点清单列表', 3, this.collectionTableHeader);
    let errorCount = 0;
    const errorDetail = [];
    let successCount = 0;
    for (const row of rows) {
      const filterRow = objectDeleteNull(row);
      try {
        await this.execlImportAdd(filterRow);
        successCount++
      } catch (error) {
        errorCount++
        errorDetail.push({
          index: row.rowNumber,
          msg: error,
          success: false,
        })
      }
    }

    return {
      totalCount: rows.length,
      errorCount,
      errorDetail,
      successCount,
    }
  }

  async execlImportAdd(row: any) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const arr = [
      'rowNumber',
      'serialNumber',
      'listCode',
      'listName',
      'listCharacteristic',
      'unit',
      'unitPrice',
      'quantities',
      'total',
    ];
    const excelWorkPlaceCode = Object.keys(row).filter((item) => !arr.includes(item));
    // console.log(excelWorkPlaceCode);
    const workPlaceCode = excelWorkPlaceCode
      .map((item) => {
        if (item.includes('_')) {
          return item.split('_')[0];
        } else {
          return item;
        }
      })
      .filter((value, index, self) => self.indexOf(value) === index);
    const workPlaceList = await this.prisma.workPlace.findMany({
      where: {
        deleteflag: 0,
        tenantId,
        workPlaceCode: {
          in: workPlaceCode,
        },
      },
    });
    const list = await this.prisma.list.findFirst({
      where: {
        listCode: row.listCode,
        deleteflag: 0,
        tenantId,
      },
    });
    // console.log(row);
    for (const code of workPlaceCode) {
      const obj = { tenantId };
      const workPlace = workPlaceList.find((item) => item.workPlaceCode === code);
      if (workPlace.workPlaceType === WorkPlaceType.STATION) {
        obj['allQuantities'] = row[code];
      } else if (workPlace.workPlaceType === WorkPlaceType.SECTION) {
        obj['leftQuantities'] = row[code + '_left'];
        obj['rightQuantities'] = row[code + '_right'];
        obj['allQuantities'] = Number(Decimal.add(row[code + '_left'], row[code + '_right']));
      }
      obj['workPlaceId'] = workPlace.id;
      obj['listId'] = list.id;

      await this.workPlaceListAddOrUpdate(obj);
    }
  }

  async workPlaceListAddOrUpdate(row: any) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const workPlaceList = await this.prisma.workPlaceList.findFirst({
      where: {
        workPlaceId: row.workPlaceId,
        listId: row.listId,
        tenantId,
        deleteflag: 0,
      },
    });
    if (workPlaceList) {
      await this.prisma.workPlaceList.update({
        where: {
          id: workPlaceList.id,
        },
        data: {
          allQuantities: row.allQuantities,
          leftQuantities: row.leftQuantities,
          rightQuantities: row.rightQuantities,
        },
      });
    } else {
      await this.prisma.workPlaceList.create({
        data: {
          allQuantities: row.allQuantities,
          leftQuantities: row.leftQuantities,
          rightQuantities: row.rightQuantities,
          workPlaceId: row.workPlaceId,
          listId: row.listId,
          tenantId,
        },
      });
    }
  }
}
