import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { DictInterceptor } from '../interceptor/dict.interceptor';

export function DictTransform(perms: { dictType: string; field: string }[]) {
  return applyDecorators(
    SetMetadata('dictConvertField', perms),
    UseInterceptors(DictInterceptor),
  );
}
