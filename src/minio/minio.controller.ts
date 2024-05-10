import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MinioService } from './minio.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';
import { Result } from 'src/common/result';

@ApiTags('minio')
@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @ApiOperation({ summary: '导入文件' })
  @ApiBearerAuth()
  @Auth() 
  @Post('/import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() data: any,@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    console.log(data.keyStartsWith);
    return await this.minioService.uploadFile(file)
  }

  @ApiOperation({ summary: '获取临时密钥上传' })
  @ApiBearerAuth()
  @Auth()
  @Get('/getSecretKey')
  async getSecretKey(@Query('fileName') fileName: string, @Query('keyStartsWith') keyStartsWith: string) {
    const data = await this.minioService.getUploadSecretKey(fileName, keyStartsWith);
    return Result.success(data);
  }

  @ApiOperation({ summary: '私有库临时上传' })
  @ApiBearerAuth()
  @Auth()
  @Get('/private/secretKey')
  async getPrivateSecretKey(@Query('fileName') fileName?: string, @Query('keyStartsWith') keyStartsWith?: string) {
    const data = await this.minioService.getPrivateUploadSecretKey(fileName, keyStartsWith);
    return Result.success(data);
  }
}
