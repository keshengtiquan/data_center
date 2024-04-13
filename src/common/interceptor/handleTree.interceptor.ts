import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { handleTree } from 'src/utils/tree';
@Injectable()
export class HandleTreeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (data.data) {
          if (data.data.length > 0) {
            data.data = handleTree(data.data);
          } else {
            return data;
          }
        }
      }),
    );
  }
}
