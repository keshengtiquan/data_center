import { Module } from '@nestjs/common';
import { UserModule } from './sys/user/user.module';
import { PrismaModule } from './prisma1/prisma.module';
import { AuthModule } from './sys/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './sys/role/role.module';
import { ClsModule } from 'nestjs-cls';
import { TenantModule } from './sys/tenant/tenant.module';
import { TenantPackageModule } from './sys/tenant-package/tenant-package.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { MenuModule } from './sys/menu/menu.module';
import { CompanyDeptModule } from './sys/company-dept/company-dept.module';
import { DictModule } from './sys/dict/dict.module';
import { RedisModule } from './redis/redis.module';
import { GenerateModule } from './generate/generate.module';
import { TestModule } from './sys/test/test.module';
import { DivisionModule } from './dc/division/division.module';
import { ListModule } from './dc/list/list.module';
import { WorkPlaceModule } from './dc/work-place/workPlace.module';
import { LogModule } from './log/log.module';
import { DeptModule } from './dc/dept/dept.module';
import { SectorModule } from './dc/sector/sector.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { SysTaskModule } from './sys/sys-task/sys-task.module';
import { ExcelModule } from './excel/excel.module';
import { PublicApiModule } from './sys/public-api/public-api.module';
import { MinioModule } from './minio/minio.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('headers', req);
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m', // 默认 30 分钟
          },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    PrismaModule,
    AuthModule,
    RoleModule,
    TenantModule,
    TenantPackageModule,
    MenuModule,
    CompanyDeptModule,
    DictModule,
    RedisModule,
    GenerateModule,
    TestModule,
    DivisionModule,
    ListModule,
    WorkPlaceModule,
    LogModule,
    DeptModule,
    SectorModule,
    TaskModule,
    SysTaskModule.forRoot(),
    ExcelModule,
    PublicApiModule,
    MinioModule,
    KnowledgeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
