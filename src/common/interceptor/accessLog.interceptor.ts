import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, mergeMap } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatDate } from 'src/utils/data';
import { getIp } from 'src/utils/ip';
import { getUserAgent } from 'src/utils/uaParserJs';
import IP2Region from 'ip2region';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 日志参数{ name: string }
    const logData = this.reflector.get('accessLog', context.getHandler());
    // 请求对象
    const request = context.switchToHttp().getRequest();
    // 获取请求设备参数
    const userAgent = getUserAgent(request.headers['user-agent']);

    const queryAddress = new IP2Region();

    const ip = getIp(request);

    const address = queryAddress.search(ip);
    const addressArr = []
    Object.keys(address).forEach((key) => {
      if (address[key] === '' || address[key] === null || address[key] === undefined) {
        return; 
      }
      addressArr.push(address[key]);
    });
    const createLog = {
      category: logData.category,
      name: logData.name,
      exeStatus: 'success',
      opIp: ip,
      opAddress: addressArr.join('|'),
      opBrowser: userAgent.borwser.name,
      opOs: userAgent.os.name,
      opUser: '',
      opTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    };

    return next.handle().pipe(
      mergeMap(async (data) => {
        this.createLogAsync(createLog, data);
        return data;
      }),
    );
  }

  private async createLogAsync(createLog: any, data: any): Promise<void> {
    createLog.opUser = data.data.userInfo.nickName;
    await this.prisma.log.create({
      data: createLog,
    });
  }
}
