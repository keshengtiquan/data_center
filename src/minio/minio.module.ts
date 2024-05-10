import { Global, Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { UserModule } from 'src/sys/user/user.module';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Global()
@Module({
  imports: [UserModule],
  controllers: [MinioController],
  providers: [
    MinioService,
    {
      provide: MINIO_CLIENT,
      async useFactory(configService: ConfigService) {
        const client = new Minio.Client({
          endPoint: configService.get('minio_api'),
          port: +configService.get('minio_port'),
          useSSL: configService.get('minio_use_ssl') === 'true',
          accessKey: configService.get('minio_access_key'),
          secretKey: configService.get('minio_secret_key'),
        });
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MinioService, MINIO_CLIENT],
})
export class MinioModule {}
