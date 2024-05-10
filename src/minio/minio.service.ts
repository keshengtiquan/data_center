import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { UserService } from 'src/sys/user/user.service';

@Injectable()
export class MinioService {

  private minioClient: Minio.Client;
  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('minio_api'),
      port: +this.configService.get('minio_port'),
      useSSL: this.configService.get('minio_use_ssl') === 'true',
      accessKey: this.configService.get('minio_access_key'),
      secretKey: this.configService.get('minio_secret_key'),
    });
  }

  async getUploadSecretKey(fileName: string, keyStartsWith: string): Promise<any> {
    const bucketName = this.configService.get('minio_bucket_name_public');
    const fileKey = `${keyStartsWith ? keyStartsWith + '/' : ''}${fileName}`;
    const expires = new Date();
    expires.setSeconds(60 * 10);

    const policy = this.minioClient.newPostPolicy();
    policy.setExpires(expires);
    policy.setBucket(bucketName);
    policy.setKey(fileKey);

    return await this.minioClient.presignedPostPolicy(policy);
  }

  async getPrivateUploadSecretKey(fileName: string, keyStartsWith: string) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    const fileKey = `${keyStartsWith ? keyStartsWith + '/' : ''}${fileName ? fileName : ''}`;
    const expires = new Date();
    expires.setSeconds(60 * 10);

    const policy = this.minioClient.newPostPolicy();
    policy.setExpires(expires);
    policy.setBucket(bucketName);
    policy.setKey(fileKey);

    return await this.minioClient.presignedPostPolicy(policy);
  }

  async getPrivatPreviewUrl(fileName: string) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    const expires = 60 * 10; // 10 minutes
    return await this.minioClient.presignedGetObject(bucketName, fileName, expires);
  }

  async uploadFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    return await this.minioClient.putObject(bucketName, file.originalname, file.buffer);
  }

}
