import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Header,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Result } from 'src/common/result';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { FindListDto } from './dto/find-list.dto';
import { ForbiddenUserDto } from './dto/forbidden-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from 'src/common/decorators/user.dectorator';
import { User } from '@prisma/client';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import { FileNameEncodePipe } from 'src/common/pipe/fileNameEncodePipe';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { ExportUserDto } from './dto/export-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建用户')
  async create(@Body() createUserDto: CreateUserDto) {
    return Result.success(await this.userService.create(createUserDto), '用户创建成功');
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'current',
    type: Number,
    description: '当前页数',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: '每页显示条数',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'nickName',
    type: String,
    description: '用户昵称',
    required: false,
  })
  @ApiQuery({
    name: 'userName',
    type: String,
    description: '账号',
    required: false,
  })
  @Get('/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  async getlist(@Query() findListDto: FindListDto) {
    const data = await this.userService.getList(findListDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '查询项目用户' })
  @ApiBearerAuth()
  @Get('/tenant/getlist')
  @Auth()
  @UseInterceptors(UtcToLocalInterceptor)
  async getTenantList(@Query() paginationDto: PaginationDto) {
    const data = await this.userService.getTenantList(paginationDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '禁用用户' })
  @ApiBearerAuth()
  @ApiBody({ type: ForbiddenUserDto })
  @Post('/forbidden')
  @Auth()
  @OpLog('禁用/启用用户')
  async forbiddenUser(@Body() forbiddenUserDto: ForbiddenUserDto) {
    const data = await this.userService.forbidden(forbiddenUserDto);
    return Result.success(data, forbiddenUserDto.status === '1' ? '禁用成功' : '启用成功');
  }

  @ApiOperation({ summary: '根据id获取用户信息' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'id', type: Number, required: true })
  @Get('/get')
  @Auth()
  async getOneById(@Query('id') id: number) {
    const data = await this.userService.getOneById(id);
    return Result.success(data);
  }

  @ApiOperation({ summary: '修改用户信息' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('修改用户信息')
  async update(@Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(updateUserDto);
    return Result.success(data, '用户更新成功');
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除用户')
  async delete(@Body('id') id: number, @UserInfo() userInfo: User) {
    const data = await this.userService.delete(id, userInfo);
    return Result.success(data, '删除用户成功');
  }

  @ApiOperation({ summary: '导入清单' })
  @ApiBearerAuth()
  @Auth()
  @Post('/import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importUserFile(@UploadedFile(new FileNameEncodePipe()) file: Express.Multer.File) {
    const data = await this.userService.importUserFile(file);
    return Result.success(data, '导入清单成功');
  }

  @ApiOperation({ summary: '导出清单' })
  @ApiBearerAuth()
  @Auth()
  @Post('/export/list')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async exportUserList(@Body() exportUserDto: ExportUserDto, @Res() res: Response) {
    const fileName = await this.userService.exportUserList(exportUserDto);

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    fileStream.on('error', (error) => {
      return Result.error(error.message);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '导出模版' })
  @ApiBearerAuth()
  @Auth()
  @Post('/export/template')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async exportUserTemplate(@Res() res: Response) {
    const fileName = await this.userService.exportUserTemplate();

    const filePath = path.join(process.cwd(), fileName);
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('end', () => {
      // Optional: Delete the file after sending
      fs.unlinkSync(filePath);
    });
    fileStream.on('error', (error) => {
      return Result.error(error.message);
    });
    return fileStream.pipe(res);
  }

  @ApiOperation({ summary: '更新用户头像' })
  @ApiBearerAuth()
  @Auth()
  @Post('/update/avatar')
  @HttpCode(HttpStatus.OK)
  @OpLog('更新用户头像')
  async updateUserAvatat(@Body('avatar') avatar: string) {
    const data = await this.userService.updateUserAvatat(avatar);
    return Result.success(data, '用户头像更新成功');
  }

  @ApiOperation({ summary: '更新用户密码' })
  @ApiBearerAuth()
  @Auth()
  @Post('/update/password')
  @HttpCode(HttpStatus.OK)
  @OpLog('更新用户密码')
  async updateUserPassword(@Body() changePasswordDto: ChangePasswordDto) {
    const data = await this.userService.updateUserPassword(changePasswordDto);
    return Result.success(data, '用户密码更新成功');
  }
}
