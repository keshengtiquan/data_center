import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {DocumentInfoDto, OnlyofficeEditorConfig} from './dto/documnet.dto';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {OnlyofficeCallbackDto} from './dto/callback.dto';
import {HttpService} from '@nestjs/axios';
import axios from 'axios';
import {ClsService} from 'nestjs-cls';
import {DocumentType} from 'src/common/enum';
import {PrismaService} from 'src/prisma1/prisma.service';
import {MinioService} from 'src/minio/minio.service';
import * as uuid from 'uuid';

@Injectable()
export class OnlyofficeService {
  @Inject()
  private config: ConfigService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(HttpService)
  private readonly httpService: HttpService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  @Inject()
  private prisma: PrismaService;
  @Inject(MinioService)
  private readonly minio: MinioService;

  async documentInfo(query: DocumentInfoDto) {
    const userInfo = this.cls.get('headers').user as any;
    const editorConfig = this.editorDefaultConfig();
    const fileInfo = await this.prisma.konwledge.findUnique({
      where: {
        id: query.id,
      },
    });
    // 添加文档
    editorConfig.document = {
      ...editorConfig.document,
      fileType: query.fileType,
      key: fileInfo.key ? fileInfo.key : `${fileInfo.id}_null`,
      url: query.url,
      title: query.title,
    };
    // 修改文档宽度
    editorConfig.width = '100%';
    editorConfig.height = '100%';
    // 修改编辑器类型
    editorConfig.documentType = DocumentType[query.fileType];

    // 添加用户信息
    editorConfig.editorConfig.user = { id: userInfo.id, name: userInfo.nickName };

    // return this.signJwt(editorConfig);
    
    return editorConfig;
  }

  /**
   *  默认配置
   */
  editorDefaultConfig(): OnlyofficeEditorConfig {
    const { ...defaultConfig } = new OnlyofficeEditorConfig();
    return defaultConfig;
  }

  /**
   * JWT加密
   * @param editorConfig
   */
  signJwt(editorConfig: OnlyofficeEditorConfig): OnlyofficeEditorConfig {
    editorConfig.token = this.jwtService.sign(editorConfig, {
      secret: this.config.get('onlyoffice_secret'),
    });
    return editorConfig;
  }

  async callback(body: OnlyofficeCallbackDto) {
    const { url, status, key } = body;
   
    
    if (status === 2 || status === 3) {
      // 用户关闭了文档  保存有延迟
      try {
        const file = await axios.get(url, {
          responseType: 'stream',
        });
        await this.uploadFile(key, file);
        await this.updateKey(key);
      } catch (error) {
        throw new HttpException({ error: 7 }, HttpStatus.BAD_REQUEST);
      }
    }
    if (status === 6) {
      // 用户点击了保存按钮
      try {
        const file = await axios.get(url, {
          responseType: 'stream',
        });
        await this.uploadFile(key, file);
      } catch (error) {
        throw new HttpException({ error: 7 }, HttpStatus.BAD_REQUEST);
      }
    }
    if(status === 7) {
      throw new HttpException({ error: status }, HttpStatus.BAD_REQUEST);
    }
    return { error: 0 };
  }

  async uploadFile(keyString: string, file: any) {
    const [id] = keyString.split('_');
    const fileInfo = await this.prisma.konwledge.findUnique({
      where: {
        id: +id,
      },
    });

    await this.minio.officeUpload(fileInfo.filePath, file.data);
  }

  async updateKey(keyString: string) {
    const [id] = keyString.split('_');
    await this.prisma.konwledge.update({
      where: { id: +id },
      data: {
        key: id + '_' + uuid.v4(),
      },
    });
  }
}
