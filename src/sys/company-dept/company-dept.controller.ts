import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyDeptService } from './company-dept.service';
import { CreateCompanyDeptDto } from './dto/create-company-dept.dto';
import { Auth } from '../auth/decorators/auth.decorators';
import { Result } from 'src/common/result';
import { FindTreeNodeDto } from './dto/company-dept.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateCompanyDeptDto } from './dto/update-company-dept.dto';

@ApiTags('组织机构')
@Controller('company-dept')
export class CompanyDeptController {
  constructor(private readonly companyDeptService: CompanyDeptService) {}

  @ApiOperation({ summary: '创建组织机构' })
  @ApiBody({ type: CreateCompanyDeptDto })
  @ApiBearerAuth()
  @Post('/create')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createCompanyDeptDto: CreateCompanyDeptDto) {
    const data = await this.companyDeptService.create(createCompanyDeptDto);
    return Result.success(data, '创建成功');
  }

  @ApiOperation({ summary: '获取组织机构列表' })
  @ApiBearerAuth()
  @Get('/getlist')
  @Auth()
  async getlist() {
    const data = await this.companyDeptService.getlist();
    return Result.success(data, '获取成功');
  }

  @ApiOperation({ summary: '获取组织机构树' })
  @ApiBearerAuth()
  @Get('/getTreeNode')
  @Auth()
  async getTreeNode(@Query() findTreeNodeDto: FindTreeNodeDto) {
    const data = await this.companyDeptService.getTreeNode(findTreeNodeDto);
    return Result.success(data, '获取成功');
  }

  @ApiOperation({ summary: '删除组织机构' })
  @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
  @ApiBearerAuth()
  @Post('/delete')
  @Auth()
  async deleteCompanyDept(@Body('id') id: number) {
    const data = await this.companyDeptService.deleteCompanyDept(id);
    return Result.success(data, '删除成功');
  }

  @ApiOperation({ summary: '批量删除组织机构' })
  @ApiBearerAuth()
  @ApiBody({ schema: { properties: { id: { type: 'array' } } } })
  @Post('/batchDelete')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async batchDelete(@Body('ids') ids: number[]) {
    const data = await this.companyDeptService.batchDelete(ids);
    return Result.success(data, '删除成功');
  }

  @ApiOperation({ summary: '修改组织机构' })
  @ApiBearerAuth()
  @Get('/get')
  @Auth()
  async getDeptById(@Query('id') id: number) {
    const data = await this.companyDeptService.getDeptById(id);
    return Result.success(data, '获取成功');
  }

  @ApiOperation({ summary: '修改组织机构' })
  @ApiBody({ type: UpdateCompanyDeptDto })
  @ApiBearerAuth()
  @Post('/update')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async updateCompanyDept(@Body() updateCompanyDeptDto: UpdateCompanyDeptDto) {
    const data = await this.companyDeptService.updateCompanyDept(
      updateCompanyDeptDto,
    );
    return Result.success(data, '修改成功');
  }
}
