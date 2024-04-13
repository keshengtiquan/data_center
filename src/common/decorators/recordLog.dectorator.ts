import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AccessLogInterceptor } from '../interceptor/accessLog.interceptor';
import { OpLogInterceptor } from '../interceptor/opLog.interceptor';
export type categoryName = 'login' | 'logout' | 'operate' | 'exception';
export function AccessLog(perms: { category: categoryName, name: string }) {
  return applyDecorators(SetMetadata('accessLog', perms), UseInterceptors(AccessLogInterceptor));
}

export function OpLog(perms:string ) {
  return applyDecorators(SetMetadata('opLog', perms), UseInterceptors(OpLogInterceptor));
}
  