import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, mergeMap } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleTree } from 'src/utils/tree';

@Injectable()
export class DictInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dictConvertField = this.reflector.get(
      'dictConvertField',
      context.getHandler(),
    );
    if (!dictConvertField) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap(async (data) => {
        if (data.data.results.length > 0) {
          const updatedData = await this.processData(
            data.data.results,
            dictConvertField,
          );
          data.data.results = updatedData;
          return data;
        } else {
          return data;
        }
      }),
    );
  }

  private async processData(
    data: any[],
    dictConvertField: { dictType: string; field: string }[],
  ) {
    const dictList = await this.prisma.dict.findMany();
    const dictTree = handleTree(dictList);
    console.log(dictConvertField);

    // 字典值转换为字典标签
    const updateNodeUsernames = (node) => {
      dictConvertField.forEach((item) => {
        if (node[item.field]) {
          const dict = dictTree.find(
            (dict) => dict.dictValue === item.dictType,
          );
          node[item.field] = dict.children.find(
            (child) => child.dictValue === node[item.field],
          ).dictLabel;
        }
      });
      return node;
    };

    return data.map(updateNodeUsernames);
  }
}
