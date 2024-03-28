import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserNameToIdPipe implements PipeTransform {
  constructor(private readonly transformField: string[]) {}

  async transform(value: any) {
    const personnel = new Set<string>();
    this.transformField.forEach((field) => {
      if (typeof value[field] === 'number') return;
      personnel.add(value[field]);
    });
    const prisma = new PrismaClient();
    if (personnel.size > 0) {
      const perArr: string[] = Array.from(personnel);
      const data = await prisma.user.findMany({
        where: { nickName: { in: perArr } },
      });
      this.transformField.forEach((field) => {
        const user = data.find((item) => item.nickName === value[field]);
        value[field] = user.id;
      });
    }

    return value;
  }
}
