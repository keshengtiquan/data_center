import { Controller, Get, Query } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { Auth } from '../auth/decorators/auth.decorators';
import { FindListDto } from './dto/find-project-list.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindWorkPlaceListDto } from './dto/find-workplace-list.dto';

@ApiTags('公共接口')
@Controller('public-api')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @ApiOperation({ summary: '获取项目列表' })
  @ApiBearerAuth()
  @Get('/project/list')
  @Auth()
  async getProjectList(@Query() findListDto: FindListDto) {
    // 获取项目列表
    return await this.publicApiService.getProjectList(findListDto);
  }

  @ApiOperation({ summary: '获取作业队' })
  @ApiBearerAuth()
  @Get('/operation/team')
  @Auth()
  async getTeamList() {
    return await this.publicApiService.getTeamList();
  }

  @ApiOperation({ summary: '获取作业队清单工程量' })
  @ApiBearerAuth()
  @Get('/operation/team/list')
  @Auth()
  async getOperationTeamList(@Query() findListDto: FindListDto) {
    return await this.publicApiService.getOperationTeamList(findListDto);
  }

  @ApiOperation({ summary: '获取工点列表' })
  @ApiBearerAuth()
  @Get('/workPlace/list')
  @Auth()
  async getWorkPlaceList(@Query() findWorkPlaceListDto: FindWorkPlaceListDto) {
    return await this.publicApiService.getWorkPlaceList(findWorkPlaceListDto);
  }

  @ApiOperation({ summary: '获取工点清单计划工程量' })
  @ApiBearerAuth()
  @Get('/list/planQuantities')
  @Auth()
  async getPlanQuantities(@Query() findListDto: FindListDto) {
    return await this.publicApiService.getPlanQuantities(findListDto)
  }
}
