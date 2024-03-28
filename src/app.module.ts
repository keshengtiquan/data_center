import { Module } from '@nestjs/common';
import { UserModule } from './sys/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
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
