import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import Decimal from 'decimal.js';

@Injectable()
export class OutputValueInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (data.data) {
          if (data.data.length > 0) {
            this.calculateOutputValue(data.data[0]);
          }
        }
      }),
    );
  }

  calculateOutputValue(node: any) {
    if (node.children && node.children.length > 0) {
      // 如果当前节点有子节点，对每个子节点进行递归计算
      let sum = 0;
      for (const child of node.children) {
        sum = Number(Decimal.add(sum, this.calculateOutputValue(child)));
      }
      node.outputValue = sum; // 更新当前节点的outputValue为子节点之和
    }
    return parseFloat(node.outputValue); // 返回当前节点的outputValue
  }
}
