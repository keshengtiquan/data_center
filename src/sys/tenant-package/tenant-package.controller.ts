import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TenantPackageService } from './tenant-package.service';
import { CreateTenantPackageDto } from './dto/create-tenant-package.dto';
import { UpdateTenantPackageDto } from './dto/update-tenant-package.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { FindPackageListDto } from './dto/find-tenant-package.dto';

@ApiTags('项目套餐管理')
@Controller('package')
export class TenantPackageController {
  constructor(private readonly tenantPackageService: TenantPackageService) {}

  @ApiOperation({ summary: '创建项目套餐' })
  @ApiBody({ type: CreateTenantPackageDto })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createTenantPackageDto: CreateTenantPackageDto) {
    return Result.success(
      await this.tenantPackageService.create(createTenantPackageDto),
    );
  }

  @ApiOperation({ summary: '获取项目套餐列表' })
  @ApiBearerAuth()
  @Get('/getList')
  @Auth()
  async getList(@Query() findPackageListDto: FindPackageListDto) {
    return Result.success(
      await this.tenantPackageService.getList(findPackageListDto),
    );
  }

  @ApiOperation({ summary: '获取项目套餐详情' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async getOne(@Query('id') id: number) {
    return Result.success(await this.tenantPackageService.getOne(id));
  }

  @ApiOperation({ summary: '更新项目套餐' })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async update(@Body() updatePackageDto: UpdateTenantPackageDto) {
    return Result.success(
      await this.tenantPackageService.update(updatePackageDto),
      '套餐更新成功',
    );
  }

  @ApiOperation({ summary: '删除项目套餐' })
  @ApiBearerAuth()
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @Post('/delete')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async delete(@Body('id') id: number) {
    return Result.success(
      await this.tenantPackageService.delete(id),
      '删除成功',
    );
  }
}
