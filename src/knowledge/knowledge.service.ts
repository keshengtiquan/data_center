import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import { CreateFolderDto } from './dto/create-folder.dto';
import { User } from '@prisma/client';
import { handleTree } from 'src/utils/tree';
import { FindFileListDto } from './dto/find-file.dto';
import { UploadFolderDto } from './dto/upload-folder.dto';
import * as Minio from 'minio';
import { MINIO_CLIENT } from 'src/minio/minio.module';
import { ConfigService } from '@nestjs/config';
import { extractFileType } from 'src/utils/file';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class KnowledgeService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject(MINIO_CLIENT)
  private minioClient: Minio.Client;
  @Inject(ConfigService)
  private readonly configService: ConfigService;
  @Inject(MinioService)
  private readonly minioService: MinioService;

  /**
   * 创建文件夹
   * @param createFolderDto
   */
  async createFolder(createFolderDto: CreateFolderDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];

    return await this.prisma.konwledge.create({
      data: {
        parentId: createFolderDto.parentId,
        fileName: createFolderDto.fileName,
        sortNumber: createFolderDto.sortNumber,
        fileType: '文件夹',
        createBy: userInfo.userName,
        updateBy: userInfo.userName,
        tenantId,
        isFolder: true,
      },
    });
  }

  /**
   * 获取文件夹
   */
  async getFolder() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const list = await this.prisma.konwledge.findMany({
      where: {
        deleteflag: 0,
        tenantId,
        isFolder: true,
      },
    });

    return handleTree(list);
  }

  /**
   * 根据parentId获取文件
   * @param parentId
   */
  async getFolderList(findFileListDto: FindFileListDto) {
    const { parentId, current, pageSize } = findFileListDto;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const condition = {
      parentId,
      deleteflag: 0,
      tenantId,
    };

    const list = await this.prisma.konwledge.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    return {
      results: list,
      total: await this.prisma.konwledge.count({ where: condition }),
      pageSize,
      current,
    };
  }

  /**
   * 更新文件夹
   * @param updateFolderDto
   */
  async uploadFolder(updateFolderDto: UploadFolderDto) {
    return await this.prisma.konwledge.update({
      where: {
        id: updateFolderDto.id,
      },
      data: { ...updateFolderDto },
    });
  }

  /**
   * 获取文件夹信息
   * @param id
   */
  async getFolderInfo(id: number) {
    return await this.prisma.konwledge.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * 上传文件
   * @param data
   * @param file
   */
  async uploadFile(data: any, file: Express.Multer.File) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const fileName = data.keyStartsWith ? data.keyStartsWith + '/' + file.originalname : file.originalname;

    const bucketName = this.configService.get('minio_bucket_name_private');
    const res = await this.minioClient.putObject(bucketName, fileName, file.buffer);
    if (res.etag) {
      const fileSize = file.size;
      const fileType = extractFileType(file.originalname);
      const filePath = 'http://' + this.configService.get('minio_api') + '/' + bucketName + '/' + fileName;
      await this.prisma.konwledge.create({
        data: {
          tenantId,
          parentId: +data.parentId,
          fileName: file.originalname,
          filePath,
          fileSize,
          fileType,
          sortNumber: 0,
          createBy: userInfo.userName,
          updateBy: userInfo.userName,
        },
      });
    }

    return res;
  }

  /**
   * 下载文件
   * @param fileName
   */
  async downloadFile(fileName: string) {
    const bucketName = this.configService.get('minio_bucket_name_private');
    const dataStream = await this.minioClient.getObject(bucketName, fileName);
    return dataStream;
  }

  /**
   * 获取文件预览地址
   * @param fileName
   */
  async getPreviewUrl(filePath: string) {
    const substring =
      'http://' + this.configService.get('minio_api') + '/' + this.configService.get('minio_bucket_name_private') + '/';
    const fileName = filePath.replace(substring, '');

    return await this.minioService.getPrivatPreviewUrl(fileName);
  }

  /**
   * 修改文件名
   * @param id
   * @param fileName
   */
  async updateFileName(id: number, fileName: string, suffix: string) {
    if (fileName.includes('.')) {
      throw new BadRequestException('文件名不能包含"."');
    }
    return await this.prisma.konwledge.update({
      where: {
        id: id,
      },
      data: {
        fileName: fileName + '.' + suffix,
      },
    });
  }

  /**
   * 移动文件
   * @param id
   * @param parentId
   */
  async moveFile(id: number, parentId: number) {
    return await this.prisma.konwledge.update({
      where: {
        id,
      },
      data: {
        parentId,
      },
    });
  }

  /**
   * 删除文件
   * @param id
   */
  async deleteFile(id: number) {
    return await this.prisma.konwledge.update({
      where: {
        id,
      },
      data: {
        deleteflag: 1,
      },
    });
  }
}
