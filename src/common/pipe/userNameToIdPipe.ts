import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserNameToIdPipe implements PipeTransform {
  constructor(private readonly transformField: string[]) {}

  async transform(value: any) {
    const personnel = [];
    this.transformField.forEach((field) => {
      if (typeof value[field] === 'number') return;
      personnel.push(value[field]);
    });
    const prisma = new PrismaClient();
    if (personnel.length > 0) {
      const data = await prisma.user.findMany({
        where: { userName: { in: personnel } },
      });
      this.transformField.forEach((field) => {
        const user = data.find((item) => item.userName === value[field]);
        value[field] = user.id;
      });
    }

    return value;
  }
}
