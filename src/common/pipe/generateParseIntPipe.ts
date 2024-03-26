import { BadRequestException, ParseIntPipe } from '@nestjs/common';

/**
 * 转数字管道
 * @param name
 */
export function generateParseIntPipe(name) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(name + ' 应该传数字');
    },
  });
}
