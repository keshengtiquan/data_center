import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as Exceljs from 'exceljs';
import { ClsService } from 'nestjs-cls';
import { blackBorderStyle, blackFontStyle, instructionStyle, middleAlignmentStyle, redFontStyle } from './tableStyle';

export type HeaderDataType = {
  width: number;
  key: string;
  header: string;
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
  async parseExcel(file: any, sheetName: string, skipRows: number) {
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
        const key = this.columnIndexToColumnLetter(col);
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
   * 导出模版
   * @param options
   * @returns
   */
  async exportTableHeader(options: { tableHeader: HeaderDataType[]; fillInstructions: string; select: SelectType[] }) {
    const { tableHeader, fillInstructions, select } = options;
    const userInfo = this.cls.get('headers').user as User;
    // 创建工作簿
    const workbook = new Exceljs.Workbook();
    workbook.creator = userInfo.nickName;
    workbook.created = new Date();
    // 添加工作表
    const worksheet = workbook.addWorksheet('sys_user');
    // 添加表头
    worksheet.columns = tableHeader;
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
        console.log(item.formulae);

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
