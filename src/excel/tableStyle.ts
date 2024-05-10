import { Alignment, Borders, Font } from 'exceljs';

// 黑色字体
export const blackFontStyle: Partial<Font> = {
  size: 12,
  bold: true,
  color: { argb: '000000' },
};


// 黑色边框
export const blackBorderStyle: Partial<Borders> = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } },
};

// 居中样式
export const middleAlignmentStyle: Partial<Alignment> = { vertical: 'middle', horizontal: 'center' };

// 红色字体
export const redFontStyle: Partial<Font> = {
  size: 12,
  bold: true,
  color: { argb: 'FF0000' },
};

// 填写说明样式
export const instructionStyle = {
  font: {
    size: 12,
    bold: true,
    color: { argb: 'FF0000' },
  },
  alignment: {
    wrapText: true,
    vertical: 'middle',
    horizontal: 'left',
  },
};
