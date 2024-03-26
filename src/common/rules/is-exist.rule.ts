import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * 是否存在规则
 * @param table 要查询的表格
 * @param validationOptions 返回的提示
 */
export function IsExistRule(
  table: string,
  validationOptions: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsExistRule',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [table],
      options: validationOptions,
      validator: {
        async validate(value: string, args: ValidationArguments) {
          const prisma = new PrismaClient();
          const res = await prisma[table].findFirst({
            where: {
              [args.property]: value,
              deleteflag: 0,
            },
          });
          return Boolean(res);
        },
      },
    });
  };
}
