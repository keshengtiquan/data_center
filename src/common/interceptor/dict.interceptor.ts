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
    dictConvertField: { dictType: string; field: string; isArray: boolean }[],
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
          console.log(typeof node[item.field]);
          //字典下拉为多选时是个数组， 要在service里提前转数组
          if (item.isArray) {
            let arr: string[] = [];
            const labelArr: string[] = [];
            if (typeof node[item.field] === 'string') {
              arr = JSON.parse(node[item.field]);
            } else {
              arr = node[item.field];
            }
            arr.forEach((value) => {
              const label = dict.children.find(
                (child) => child.dictValue === value,
              );
              if (label) {
                labelArr.push(label.dictLabel);
              }
            });
            node[item.field] = labelArr;
          } else {
            node[item.field] = dict.children.find(
              (child) => child.dictValue === node[item.field],
            )
              ? dict.children.find(
                  (child) => child.dictValue === node[item.field],
                ).dictLabel
              : '';
          }
        }
      });
      return node;
    };

    return data.map(updateNodeUsernames);
  }
}
