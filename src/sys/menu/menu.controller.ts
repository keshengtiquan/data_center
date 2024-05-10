import { Controller, Get, Post, Body, HttpCode, HttpStatus, Query, UseInterceptors } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { ForbiddenMenuDto } from './dto/forbidden-menu.dto';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';

@ApiTags('菜单管理')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '创建菜单' })
  @ApiBody({ type: CreateMenuDto })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @OpLog('创建菜单')
  async create(@Body() createMenuDto: CreateMenuDto) {
    return Result.success(await this.menuService.create(createMenuDto));
  }

  @ApiOperation({ summary: '查询菜单列表' })
  @Get('/getShortcutMenu')
  @Auth()
  async getShortcutMenu(@Query('module') module: string) {
    const data = await this.menuService.getShortcutMenu(module);
    return Result.success(data);
  }

  @ApiOperation({ summary: '查询侧边菜单列表' })
  @Get('/getMenu')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async getMenu(@Query('module') module: string) {
    const data = await this.menuService.getMenu(['C', 'M'], ['0'], module);
    if (data.length === 0) return Result.error('当前用户菜单列表为空, 请联系管理员');
    return Result.success(data);
  }

  @ApiOperation({ summary: '查询查询菜单列表' })
  @Get('/getMenuList')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UtcToLocalInterceptor)
  async getMenuList(@Query('module') module: string) {
    const data = await this.menuService.getMenu(['C', 'M', 'F'], ['0', '1'], module);
    return Result.success(data);
  }

  @ApiOperation({ summary: '更新菜单列表' })
  @ApiBody({ type: UpdateMenuDto })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @OpLog('更新菜单')
  async updateMenu(@Body() updateMenuDto: UpdateMenuDto) {
    return Result.success(await this.menuService.update(updateMenuDto), '更新成功');
  }

  @ApiOperation({ summary: '根据ID查询菜单' })
  @ApiBearerAuth()
  @Get('/getOne')
  @Auth()
  async getMenuById(@Query('id') id: number) {
    return Result.success(await this.menuService.getMenuById(id));
  }

  @ApiOperation({ summary: '禁用菜单' })
  @ApiBody({ type: ForbiddenMenuDto })
  @ApiBearerAuth()
  @Post('/forbidden')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('禁用菜单')
  async forbiddenMenuById(@Body() forbiddenMenuDto: ForbiddenMenuDto) {
    return Result.success(
      await this.menuService.forbidden(forbiddenMenuDto),
      forbiddenMenuDto.status === '1' ? '禁用成功' : '启用成功',
    );
  }

  @ApiOperation({ summary: '删除菜单' })
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  @OpLog('删除菜单')
  async deleteMenuById(@Body('id') id: number) {
    return Result.success(await this.menuService.delete(id), '删除成功');
  }
}
