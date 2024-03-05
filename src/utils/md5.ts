import * as crypto from 'crypto';

/**
 * 字符串加密
 * @param str 要加密的字符串
 */
export function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}
