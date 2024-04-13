import * as uaParserJs from 'ua-parser-js';

export const getUserAgent = (userAgent: any) => {
  const parser = new uaParserJs();
  parser.setUA(userAgent)
  const borwser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    borwser,
    os,
    device
  }
}

