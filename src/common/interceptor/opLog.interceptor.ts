import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, tap } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { getIp } from 'src/utils/ip';
import { getUserAgent } from 'src/utils/uaParserJs';
import { formatDate } from 'src/utils/data';
import IP2Region from 'ip2region';

@Injectable()
export class OpLogInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 日志参数{category: string, name: string}
    const logData = this.reflector.get('opLog', context.getHandler());
    // 请求对象
    const request = context.switchToHttp().getRequest();
    const tenantId = +request.headers['x-tenant-id'];

    // 获取请求设备参数
    const userAgent = getUserAgent(request.headers['user-agent']);
    const ip = getIp(request);
    // 获取地址
    const queryAddress = new IP2Region();
    const address = queryAddress.search(ip);
    const addressArr = [];
    Object.keys(address).forEach((key) => {
      if (address[key] === '' || address[key] === null || address[key] === undefined) {
        return;
      }
      addressArr.push(address[key]);
    });

    const createLog = {
      tenantId: tenantId ? tenantId : null,
      category: 'operate',
      name: logData,
      exeStatus: 'success',
      exeMessage: '',
      opIp: ip,
      opAddress: addressArr.join('|'),
      opBrowser: userAgent.borwser.name,
      opOs: userAgent.os.name,
      className: context.getClass().name,
      methodName: context.getHandler().name,
      reqMethod: request.method,
      reqUrl: request.url,
      paramJson: request.method === 'POST' ? JSON.stringify(request.body) : JSON.stringify(request.query),
      resultJson: '',
      opTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      opUser: request.user.nickName,
    };

    return next.handle().pipe(
      tap((data) => {
        createLog.resultJson = JSON.stringify(data);
        createLog.exeMessage = data.message;
        this.createLogAsync(createLog);
      }),
      catchError((error) => {
        const res = error.getResponse() as { message: string[] };
        createLog.category = 'exception'
        createLog.exeMessage = res?.message?.join ? res?.message?.join(',') : error.message;
        createLog.exeStatus = 'fail';
        createLog.resultJson = JSON.stringify(error);
        this.createLogAsync(createLog);
        
        throw error;
      }),
    );
  }

  private async createLogAsync(createLog: any): Promise<void> {
    await this.prisma.log.create({
      data: createLog,
    });
  }
}
