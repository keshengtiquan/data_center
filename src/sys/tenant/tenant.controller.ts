import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
  Headers,
  UsePipes,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { FindTenantListDto } from './dto/find-tenant-list.dto';
import { ForbiddenTenantDto } from './dto/forbidden-tenant.dto';
import { generateParseIntPipe } from 'src/common/pipe/generateParseIntPipe';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { SaveTenantInfoDto } from './dto/save-tenant-info.dto';
import { FindTenantUserDto } from './dto/find-tenant-usr.dto';
import { AddTenantUserDto } from './dto/add-tenant-user.dto';
import { DeleteTenantUserDto } from './dto/delete-tenant-user.dto';
import { UtcToLocalInterceptor } from 'src/common/interceptor/utc2Local.interceptor';
import { UserNameToIdPipe } from 'src/common/pipe/userNameToIdPipe';
import { DictTransform } from 'src/common/decorators/dict.dectorator';
import { OpLog } from 'src/common/decorators/recordLog.dectorator';

@ApiTags('项目管理')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @ApiOperation({ summary: '创建项目' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateTenantDto })
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('创建项目')
  async create(@Body() createTenantDto: CreateTenantDto) {
    return Result.success(
      await this.tenantService.create(createTenantDto),
      '创建成功',
    );
  }

  @ApiOperation({ summary: '获取项目列表' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'companyName', description: '项目名称', required: false })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  @ApiQuery({ name: 'contactUserName', description: '联系人', required: false })
  @UseInterceptors(UtcToLocalInterceptor)
  @DictTransform([
    { dictType: 'ProjectType', field: 'projectType' },
    {
      dictType: 'ProjectProfessional',
      field: 'projectProfessional',
      isArray: true,
    },
    { dictType: 'Area', field: 'area' },
  ])
  @Get('/getlist')
  @Auth()
  async getList(@Query() findTenantListDto: FindTenantListDto) {
    return Result.success(await this.tenantService.getList(findTenantListDto));
  }

  @ApiOperation({ summary: '禁用/启用项目' })
  @ApiBody({ type: ForbiddenTenantDto })
  @ApiBearerAuth()
  @Post('/forbidden')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('禁用/启用项目')
  async forbiddenTenant(@Body() forbiddenTenantDto: ForbiddenTenantDto) {
    const data = await this.tenantService.forbidden(forbiddenTenantDto);
    return Result.success(
      data,
      forbiddenTenantDto.status === '1' ? '禁用成功' : '启用成功',
    );
  }

  @ApiOperation({ summary: '获取项目详情' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'id', description: '项目id', required: true })
  @Get('/get')
  @Auth()
  async getOne(@Query('id', generateParseIntPipe('id')) id: number) {
    const data = await this.tenantService.getOne(id);
    return Result.success(data);
  }

  @ApiOperation({ summary: '更新项目' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('更新项目')
  async updateTenant(@Body() updateTenantDto: UpdateTenantDto) {
    const data = await this.tenantService.updateTenant(updateTenantDto);
    return Result.success(data, '更新项目成功');
  }

  @ApiOperation({ summary: '删除项目' })
  @ApiBearerAuth()
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('删除项目')
  async deleteTenant(@Body('id') id: number) {
    const data = await this.tenantService.deleteTenant(id);
    return Result.success(data, '删除项目成功');
  }

  @ApiOperation({ summary: '保存项目信息' })
  @ApiBody({ type: SaveTenantInfoDto })
  @ApiBearerAuth()
  @Post('/save/tenantInfo')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new UserNameToIdPipe(['manager', 'chiefEngineer', 'safetyDirector']),
  )
  @OpLog('保存项目信息')
  async saveTenantInfo(@Body() saveTenantInfoDto: SaveTenantInfoDto) {
    const data = await this.tenantService.saveTenantInfo(saveTenantInfoDto);
    return Result.success(data, '保存项目信息成功');
  }

  @ApiOperation({ summary: '获取项目信息' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'tenantId', type: 'number', required: true })
  @Get('/get/tenantInfo')
  @Auth()
  async getTenantInfo(
    @Query('tenantId') tenantId: number,
    @Headers('x-tenant-id') headerId,
  ) {
    const data = await this.tenantService.getTenantInfo(tenantId || +headerId);
    return Result.success(data, '获取项目信息成功');
  }

  @ApiOperation({ summary: '获取项目用户' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'tenantId', type: 'number', required: true })
  @Get('/get/tenantUser')
  @UseInterceptors(UtcToLocalInterceptor)
  @Auth()
  async getTenantUser(
    @Query() findTenantUserDto: FindTenantUserDto,
    @Headers('x-tenant-id') headerId,
  ) {
    if (headerId) {
      findTenantUserDto.tenantId = +headerId;
    }

    const data = await this.tenantService.getTenantUser(findTenantUserDto);
    return Result.success(data, '获取项目用户信息成功');
  }

  @ApiOperation({ summary: '添加项目用户' })
  @ApiBody({ type: AddTenantUserDto })
  @ApiBearerAuth()
  @Post('/add/tenantUser')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @OpLog('添加项目用户')
  async addTenantUser(@Body() addTenantUserDto: AddTenantUserDto) {
    const data = await this.tenantService.addTenantUser(addTenantUserDto);
    return Result.success(data, '添加项目用户成功');
  }

  @ApiOperation({ summary: '删除项目用户' })
  @ApiBearerAuth()
  @ApiBody({ type: DeleteTenantUserDto })
  @Auth()
  @Post('/delete/tenentUser')
  @HttpCode(HttpStatus.OK)
  @OpLog('删除项目用户')
  async deleteTenantUser(@Body() deleteTenantUserDto: DeleteTenantUserDto) {
    const data = await this.tenantService.deleteTenantUser(deleteTenantUserDto);
    return Result.success(data, '删除项目用户成功');
  }
}
