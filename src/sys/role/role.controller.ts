import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleMenuDto } from './dto/role-menu.dto';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';
import { AddUserDto } from './dto/add-user.dto';
import { FindRoleUserDto } from './dto/find-role-user.dto';

@ApiTags('角色管理')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateRoleDto })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @OpLog('创建角色')
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

  @ApiOperation({ summary: '根据ID查询角色' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async findOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.roleService.findOne(id);
    return Result.success(data, '查询角色成功');
  }

  @ApiOperation({ summary: '更新角色' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新角色')
  async update(@Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.roleService.update(updateRoleDto);
    return Result.success(data, '更新角色成功');
  }

  @ApiOperation({ summary: '删除角色' })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除角色')
  async remove(@Body('id', generateParseIntPipe('id')) id: number) {
    const data = await this.roleService.remove(id);
    return Result.success(data, '删除角色成功');
  }

  @ApiOperation({ summary: '批量删除角色' })
  @ApiBearerAuth()
  @Post('/batchDelete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('批量删除角色')
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.roleService.batchDelete(ids);
    return Result.success(data, '删除角色成功');
  }

  @ApiOperation({ summary: '角色关联菜单' })
  @ApiBearerAuth()
  @Post('/menu')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('角色关联菜单')
  async roleMenu(@Body() roleMenuDto: RoleMenuDto) {
    const data = await this.roleService.roleMenu(roleMenuDto);
    return Result.success(data, '角色关联菜单成功');
  }

  @ApiOperation({ summary: '角色下的用户' })
  @ApiBearerAuth()
  @Get('/user')
  @Auth()
  async roleUser(@Query() findRoleUserDto: FindRoleUserDto) {
    const data = await this.roleService.roleUser(findRoleUserDto);
    return Result.success(data, '获取角色下的用户成功');
  }

  @ApiOperation({ summary: '角色添加用户' })
  @ApiBearerAuth()
  @Post('/addUser')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('角色添加用户')
  async addUser(@Body() addUserDto: AddUserDto) {
    const data = await this.roleService.addUser(addUserDto);
    return Result.success(data, '角色添加用户成功');
  }

  @ApiOperation({ summary: '角色关联的菜单' })
  @ApiBearerAuth()
  @Get('/menu/get')
  @Auth()
  async roleMenuList(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.roleService.roleMenuList(id);
    return Result.success(data, '获取角色关联的菜单成功');
  }
}
