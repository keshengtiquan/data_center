import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as Exceljs from 'exceljs';
import { ClsService } from 'nestjs-cls';
import { blackBorderStyle, blackFontStyle, instructionStyle, middleAlignmentStyle, redFontStyle } from './tableStyle';

export type HeaderDataType = {
  width: number;
  key: string;
  header: string;
  col: string;
};
export type SelectType = {
  column: string;
  start: number;
  end: number;
  formulae: string;
};

@Injectable()
export class ExcelService {
  @Inject(ClsService)
  private readonly cls: ClsService;

  /**
   * 解析表
   */
  async parseExcel(file: any, sheetName: string, skipRows: number, tableHeaders?: HeaderDataType[]) {
    const workbook = new Exceljs.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheetNames = [];
    //获取表格中所有的sheet名称
    for (const worksheet of workbook.worksheets) {
      worksheetNames.push(worksheet.name);
    }
    const index = worksheetNames.findIndex((item) => item === sheetName);
    //解析对应页签
    const worksheet = workbook.getWorksheet(worksheetNames[index]);
    const rows = [];
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber < skipRows) {
        return;
      }
      const rowData = { rowNumber: rowNumber };
      row.eachCell({ includeEmpty: true }, (cell: any, col) => {
        let key = this.columnIndexToColumnLetter(col);
        if (tableHeaders) {
          key = tableHeaders.find((item) => item.col === key)?.key;
        }
        switch (cell.type) {
          case 8:
            const value = [];
            cell.value.richText.forEach((item) => {
              value.push(item.text);
            });
            rowData[key] = value.join('');
            break;
          case 6:
            rowData[key] = cell.value.result;
            break;
          default:
            rowData[key] = cell.value;
            break;
        }
      });
      rows.push(rowData);
    });
    return rows;
  }

  /**
   * 导出数据
   */
  async exportExcelFile(options: {
    sheetName: string;
    tableHeader: HeaderDataType[];
    tableData: any[];
    customStyle?: any;
    mergeRowsData?: number[]; // 要合并的行号
    mergeColumnsData?: any;
  }) {
    const userInfo = this.cls.get('headers').user as User;
    const { sheetName, tableHeader, tableData, customStyle, mergeRowsData, mergeColumnsData } = options;
    // 创建工作簿
    const workbook = new Exceljs.Workbook();
    workbook.creator = userInfo.nickName;
    workbook.created = new Date();
    // 添加工作表
    const worksheet = workbook.addWorksheet(sheetName);
    // 添加表头
    worksheet.columns = tableHeader;

    // 合并行重复数据
    if (mergeRowsData && mergeRowsData.length > 0) {
      mergeRowsData.forEach((i) => {
        const row = worksheet.getRow(i).values;
        const ranges = this.margeRow(row as string[]);
        // console.log(ranges);
        ranges.forEach((range) => {
          worksheet.mergeCells(
            `${this.columnIndexToColumnLetter(range.start)}1:${this.columnIndexToColumnLetter(range.end)}1`,
          );
        });
      });
    }
    // 合并列重复数据
    if (mergeColumnsData) {
      worksheet.addRows(mergeColumnsData.rowDatas);
      const ranges = mergeColumnsData.megerColumnRanges;
      ranges.forEach((range) => {
        const excelRows = worksheet.getRows(range[0], range[1]);
        const rows = [];
        excelRows.forEach((row) => {
          const rowData = row.values as Array<string>;
          // getRows获取的values的数组第一个为<empty>,所以要把ranges的第一个去掉去掉。
          rowData.shift();
          rows.push(rowData);
        });

        const ranges = this.margeColumn(rows);
        // margeColumn方法返回的start end index都是从0开始的，要加一处理
        const formatRange = ranges
          .filter((item) => item.start !== item.end)
          .map((range) => ({
            index: (range.index += 1),
            start: (range.start += 1),
            end: (range.end += 1),
          }));
        formatRange.forEach((range) => {
          worksheet.mergeCells(
            `${this.columnIndexToColumnLetter(range.index)}${range.start}:${this.columnIndexToColumnLetter(
              range.index,
            )}${range.end}`,
          );
        });
      });
    }

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = {
        font: blackFontStyle,
        alignment: middleAlignmentStyle,
        border: blackBorderStyle,
      };
      if (cell.text.includes('*')) {
        cell.style.font = redFontStyle;
      }
    });
    // 添加数据
    if (tableData && tableData.length > 0) {
      const data = [];
      tableData.forEach((table) => {
        const obj = {};
        tableHeader.forEach((header) => {
          obj[header.key] = table[header.key];
        });
        data.push(obj);
      });
      // 添加行
      if (data) worksheet.addRows(data);
      worksheet.columns.forEach((column, index) => {
        if (customStyle && customStyle.length > 0) {
          const aa = customStyle.find((item) => item.columnIndex === index);
          if (aa) {
            column.alignment = aa.alignment as Partial<Exceljs.Alignment>;
          } else {
            column.alignment = middleAlignmentStyle;
          }
        }
      });
    }
    const dataTime = new Date().getTime();
    await workbook.xlsx.writeFile(`export-${dataTime}.xlsx`);
    return `export-${dataTime}.xlsx`;
  }

  /**
   * 导出模版
   * @param options
   * @returns
   */
  async exportTableHeader(options: {
    tableHeader: HeaderDataType[];
    sheetName?: string;
    fillInstructions?: string;
    select?: SelectType[];
    mergeRowsData?: number[]; // 要合并的行号
    mergeColumnsData?: any;
  }) {
    const { tableHeader, fillInstructions, select, sheetName, mergeRowsData, mergeColumnsData } = options;
    const userInfo = this.cls.get('headers').user as User;
    // 创建工作簿
    const workbook = new Exceljs.Workbook();
    workbook.creator = userInfo.nickName;
    workbook.created = new Date();
    // 添加工作表
    const worksheet = workbook.addWorksheet(sheetName || 'Sheet1');

    // 添加表头
    worksheet.columns = tableHeader;

    // 合并行重复数据
    if (mergeRowsData && mergeRowsData.length > 0) {
      mergeRowsData.forEach((i) => {
        const row = worksheet.getRow(i).values;
        const ranges = this.margeRow(row as string[]);
        // console.log(ranges);
        ranges.forEach((range) => {
          worksheet.mergeCells(
            `${this.columnIndexToColumnLetter(range.start)}1:${this.columnIndexToColumnLetter(range.end)}1`,
          );
        });
      });
    }
    // 合并列重复数据
    if (mergeColumnsData) {
      worksheet.addRows(mergeColumnsData.rowDatas);
      const ranges = mergeColumnsData.megerColumnRanges;
      ranges.forEach((range) => {
        const excelRows = worksheet.getRows(range[0], range[1]);
        const rows = [];
        excelRows.forEach((row) => {
          const rowData = row.values as Array<string>;
          // getRows获取的values的数组第一个为<empty>,所以要把ranges的第一个去掉去掉。
          rowData.shift();
          rows.push(rowData);
        });

        const ranges = this.margeColumn(rows);
        // margeColumn方法返回的start end index都是从0开始的，要加一处理
        const formatRange = ranges
          .filter((item) => item.start !== item.end)
          .map((range) => ({
            index: (range.index += 1),
            start: (range.start += 1),
            end: (range.end += 1),
          }));
        formatRange.forEach((range) => {
          worksheet.mergeCells(
            `${this.columnIndexToColumnLetter(range.index)}${range.start}:${this.columnIndexToColumnLetter(
              range.index,
            )}${range.end}`,
          );
        });
      });
    }
    // 如果有填写说明
    if (fillInstructions) {
      worksheet.spliceRows(1, 0, [fillInstructions]);
      // 合并单元格
      worksheet.mergeCells(`A1:${this.columnIndexToColumnLetter(tableHeader.length)}1`);
      // 设置行高
      const matches = fillInstructions.match(/\n/g);
      const row = worksheet.getRow(1);
      row.height = matches ? (matches.length + 1) * 20 : 20;
      //设置行样式
      worksheet.getCell('A1').style = instructionStyle as Partial<Exceljs.Style>;
      worksheet.getCell(`${this.columnIndexToColumnLetter(tableHeader.length)}1`).border = {
        right: { style: 'thin', color: { argb: '000000' } },
      };
    }
    // 设置下拉框
    if (select && select.length > 0) {
      select.forEach((item) => {
        for (let i = item.start; i <= item.end; i += 1) {
          worksheet.getCell(`${item.column}${i}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [item.formulae],
          };
        }
      });
    }

    // 设置表头样式
    const headerRow = worksheet.getRow(fillInstructions ? 2 : 1);
    headerRow.eachCell((cell) => {
      cell.style = {
        font: blackFontStyle,
        alignment: middleAlignmentStyle,
        border: blackBorderStyle,
      };
      if (cell.text.includes('*')) {
        cell.style.font = redFontStyle;
      }
    });
    await workbook.xlsx.writeFile('importTemplate.xlsx');
    return 'importTemplate.xlsx';
  }

  /**
   * 获取行重复区间
   * @param row
   * @returns
   */
  margeRow(row: string[]) {
    const duplicateIndexes = [];

    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        const startIndex = i;
        let endIndex = i + 1;
        while (row[endIndex] === row[i]) {
          endIndex++;
        }
        duplicateIndexes.push({ start: startIndex, end: endIndex - 1 });
        i = endIndex - 1;
      }
    }

    return duplicateIndexes;
  }

  margeColumn(arr) {
    const duplicateRanges = [];

    // 获取内部数组的长度
    const innerArrayLength = arr[0].length;

    // 遍历内部数组的每个索引位置
    for (let i = 0; i < innerArrayLength; i++) {
      let startIndex = null;
      let endIndex = null;
      let prevElement = null;

      // 遍历外部数组
      for (let j = 0; j < arr.length; j++) {
        const currentElement = arr[j][i];
        if (prevElement === null) {
          prevElement = currentElement;
          startIndex = j;
        } else if (currentElement !== prevElement) {
          if (startIndex !== null && (endIndex === null || endIndex - startIndex > 1)) {
            endIndex = j - 1;
            duplicateRanges.push({ index: i, start: startIndex, end: endIndex });
          }
          startIndex = null;
          endIndex = null;
          prevElement = null;
        }
      }

      // 处理最后一个元素相同的情况
      if (startIndex !== null && endIndex === null) {
        endIndex = arr.length - 1;
        if (startIndex !== endIndex && endIndex - startIndex > 0) {
          duplicateRanges.push({ index: i, start: startIndex, end: endIndex });
        }
      }
    }

    return duplicateRanges;
  }

  /**
   * 处理列字段 index转ABC
   * @param index
   */
  columnIndexToColumnLetter(index: number): string {
    let columnLetter = '';
    while (index > 0) {
      const remainder = (index - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      index = Math.floor((index - 1) / 26);
    }
    return columnLetter;
  }
}
