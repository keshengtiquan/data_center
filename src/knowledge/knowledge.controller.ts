import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Header,
  Res,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Auth } from 'src/sys/auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FindFileListDto } from './dto/find-file.dto';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { UploadFolderDto } from './dto/upload-folder.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('知识库')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @ApiOperation({ summary: '创建文件夹' })
  @ApiBearerAuth()
  @Post('/folder/create')
  @Auth()
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return Result.success(await this.knowledgeService.createFolder(createFolderDto));
  }

  @ApiOperation({ summary: '获取文件夹信息' })
  @ApiBearerAuth()
  @Get('/folder/get')
  @Auth()
  async getFolderInfo(@Query('id') id: number) {
    const data = await this.knowledgeService.getFolderInfo(id);
    return Result.success(data);
  }

  @ApiOperation({ summary: '更新文件夹信息' })
  @ApiBearerAuth()
  @Post('/folder/upload')
  @Auth()
  async uploadFolder(@Body() updateFolderDto: UploadFolderDto) {
    return Result.success(await this.knowledgeService.uploadFolder(updateFolderDto));
  }

  @ApiOperation({ summary: '获取文件夹树表' })
  @ApiBearerAuth()
  @Get('/folder/getTree')
  @Auth()
  async getFolder() {
    const data = await this.knowledgeService.getFolder();
    return Result.success(data);
  }

  @ApiOperation({ summary: '获取文件列表' })
  @ApiBearerAuth()
  @Get('/folder/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  async getFolderList(@Query() findFileListDto: FindFileListDto) {
    const data = await this.knowledgeService.getFolderList(findFileListDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '上传文件' })
  @ApiBearerAuth()
  @Post('/file/upload')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() data: any, @UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    return Result.success(await this.knowledgeService.uploadFile(data, file));
  }

  @ApiOperation({ summary: '下载文件' })
  @ApiBearerAuth()
  @Post('/file/download')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async downloadFile(@Body('fileName') fileName: string, @Res() res: Response) {
    const fileStream = await this.knowledgeService.downloadFile(fileName);
    const list: Buffer[] = [];

    fileStream.on('data', (chunk) => {
      list.push(chunk);
    });

    fileStream.on('end', () => {
      res.send(Buffer.concat(list));
    });
  }

  @ApiOperation({ summary: '获取文件预览地址' })
  @ApiBearerAuth()
  @Get('/file/getPreviewUrl')
  @Auth()
  async getPreviewUrl(@Query('filePath') filePath: string) {
    return Result.success(await this.knowledgeService.getPreviewUrl(filePath));
  }

  @ApiOperation({ summary: '修改文件名' })
  @ApiBearerAuth()
  @Post('/file/updateFileName')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async updateFileName(@Body('id') id: number, @Body('fileName') fileName: string, @Body('suffix') suffix: string) {
    return Result.success(await this.knowledgeService.updateFileName(id, fileName,suffix));
  }

  @ApiOperation({ summary: '移动文件' })
  @ApiBearerAuth()
  @Post('/file/moveFile')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async moveFile(@Body('id') id: number, @Body('parentId') parentId: number) {
    return Result.success(await this.knowledgeService.moveFile(id, +parentId));
  }

  @ApiOperation({ summary: '删除文件' })
  @ApiBearerAuth()
  @Post('/file/deleteFile')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Body('id') id: number) {
    return Result.success(await this.knowledgeService.deleteFile(id));
  }
}
