import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserNameToIdPipe implements PipeTransform {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;
  constructor(private readonly transformField: string[]) {}
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value, this.transformField, metadata);
    const personnel = [];
    this.transformField.forEach((field) => {
      personnel.push(value[field]);
    });
    console.log(personnel);
  }
}
