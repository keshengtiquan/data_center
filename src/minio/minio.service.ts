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

  /**
   * 获取公共仓库上传密钥
   * @param fileName 
   * @param keyStartsWith 
   * @returns 
   */
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

  /**
   * 获取私有仓库上传密钥
   * @param fileName 
   * @param keyStartsWith 
   * @returns 
   */
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

  /**
   * 获取私有仓库链接
   * @param fileName 
   * @returns 
   */
  async getPrivatPreviewUrl(fileName: string) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    const expires = 60 * 10; // 10 minutes
    return await this.minioClient.presignedGetObject(bucketName, fileName, expires);
  }

  /**
   * 上传文件
   * @param file 
   * @returns 
   */
  async uploadFile(file: Express.Multer.File) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    return await this.minioClient.putObject(bucketName, file.originalname, file.buffer);
  }

  async officeUpload(fileName: string, file: any){
    const bucketName = this.configService.get('minio_bucket_name_private');
    return await this.minioClient.putObject(bucketName, fileName, file);
  }

}
