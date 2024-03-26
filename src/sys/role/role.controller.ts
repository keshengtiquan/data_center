import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { FindRoleListDto } from './dto/find-role-list.dto';

@ApiTags('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateRoleDto })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return Result.success(
      await this.roleService.create(createRoleDto),
      '创建成功',
    );
  }

  @ApiOperation({ summary: '获取角色列表' })
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
  @Get('/getlist')
  @Auth()
  async getList(@Query() findRoleListDto: FindRoleListDto) {
    const data = await this.roleService.getList(findRoleListDto);
    return Result.success(data);
  }
}
