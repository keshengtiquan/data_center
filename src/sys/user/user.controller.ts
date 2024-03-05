import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Result } from 'src/common/result';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { FindListDto } from './dto/find-list.dto';
import { ForbiddenUserDto } from './dto/forbidden-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from 'src/common/decorators/user.dectorator';
import { User } from '@prisma/client';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @Post('/create')
  @Auth()
  async create(@Body() createUserDto: CreateUserDto) {
    return Result.success(
      await this.userService.create(createUserDto),
      '用户创建成功',
    );
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
  async getlist(@Query() findListDto: FindListDto) {
    const data = await this.userService.getList(findListDto);
    return Result.success(data);
  }

  @ApiOperation({ summary: '禁用用户' })
  @ApiBearerAuth()
  @ApiBody({ type: ForbiddenUserDto })
  @Post('/forbidden')
  @Auth()
  async forbiddenUser(@Body() forbiddenUserDto: ForbiddenUserDto) {
    const data = await this.userService.forbidden(forbiddenUserDto);
    return Result.success(
      data,
      forbiddenUserDto.status === '1' ? '禁用成功' : '启用成功',
    );
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
  async update(@Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(updateUserDto);
    return Result.success(data, '用户更新成功');
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @Post('/delete')
  @Auth()
  async delete(@Body('id') id: number, @UserInfo() userInfo: User) {
    const data = await this.userService.delete(id, userInfo);
    return Result.success(data, '删除用户成功');
  }
}
