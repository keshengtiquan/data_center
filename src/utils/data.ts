import { endOfWeek, format, startOfWeek } from 'date-fns';

export function formatDate(date: Date, format: string) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  format = format.replace('YYYY', String(year));
  format = format.replace('MM', month);
  format = format.replace('DD', day);
  format = format.replace('HH', hours);
  format = format.replace('mm', minutes);
  format = format.replace('ss', seconds);

  return format;
}

export function sqlToTs(type: string) {
  const sqlTsContrast = {
    bigint: 'number',
    int: 'number',
    double: 'number',
    float: 'number',
    char: 'string',
    varchar: 'string',
    text: 'string',
    datetime: 'string',
    bool: 'boolean',
    boolean: 'boolean',
    time: 'string',
    decimal: 'number',
    tinyint: 'boolean',
  };
  return sqlTsContrast[type];
}

/**
 * 下划线转驼峰
 * @param str
 * @returns
 */
export function toCamelCase(str: string) {
  if (str === 'delete_flag') return 'delete_flag';
  return str.replace(/_([a-z])/g, function (match, char) {
    return char.toUpperCase();
  });
}

/**
 * 获取本周的开始时间结束时间
 */
export const getWeekStartAndEnd = (date: Date) => {
  const weekStartDate = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEndDate = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  return {
    startDate: weekStartDate,
    endDate: weekEndDate,
  };
};

export const objectDeleteNull = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined && value !== 0 && value !== '',
    ),
  );
}
