import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ClsService } from 'nestjs-cls';

@ValidatorConstraint({ async: true })
@Injectable()
export class RoleNotExistsRuleExistConstraint
  implements ValidatorConstraintInterface
{
  @Inject(ClsService)
  private readonly clsService: ClsService;

  async validate(value: any, args: ValidationArguments) {
    const prisma = new PrismaClient();
    const res = await prisma.role.findFirst({
      where: {
        [args.property]: value,
        deleteflag: 0,
      },
    });
    return !Boolean(res);
  }
}

export function RoleNotExistsRule(validationOptions: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'RoleNotExistsRule',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['role'],
      options: validationOptions,
      validator: RoleNotExistsRuleExistConstraint,
    });
  };
}
