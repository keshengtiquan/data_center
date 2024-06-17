import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {NewSectorService} from './new-sector.service';
import {Auth} from "../../sys/auth/decorators/auth.decorators";
import {CreateNewSectorDto} from "./dto/create-new-sector.dto";
import {Result} from "../../common/result";
import {UpdatePathDto} from "./dto/update-path.dto";
import {PageDto} from "./dto/page.dto";
import {CreateSectionDivisionDto} from "./dto/create-section-division.dto";

@Controller('newSector')
export class NewSectorController {
  constructor(private readonly newSectorService: NewSectorService) {
  }
  
  /**
   *
   * @param createNewSectorDto
   */
  @Post('/create')
  @Auth()
  async addSector(@Body() createNewSectorDto: CreateNewSectorDto) {
    console.log(createNewSectorDto)
    const data = await this.newSectorService.create(createNewSectorDto)
    return Result.success(data)
  }
  
  @Get('/getList')
  @Auth()
  async list() {
    const data = await this.newSectorService.list()
    return Result.success(data)
  }
  
  @Post('/update/path')
  @Auth()
  async updatePath(@Body() updatePathDto: UpdatePathDto) {
    const data = await this.newSectorService.updatePath(updatePathDto)
    return Result.success(data)
  }
  
  @Get('/page')
  @Auth()
  async page(@Query() pageDto: PageDto) {
    const data = await this.newSectorService.page(pageDto)
    return Result.success(data)
  }
  
  @Post('/add/sectorDivision')
  @Auth()
  async addSectionDivision(@Body() createSectionDivisionDto: CreateSectionDivisionDto[]){
    const data = await this.newSectorService.addSectionDivision(createSectionDivisionDto)
    return Result.success(data)
  }
  
  @Get('/get/sectorDivision')
  @Auth()
  async getSectorDivision(@Query('sectorId') sectorId: number){
    const data = await this.newSectorService.getSectorDivision(sectorId)
    return Result.success(data)
  }
  
  @Post('/delete')
  @Auth()
  async deleteSector(@Body('id') id: number){
    const data = await this.newSectorService.deleteSector(id)
    return Result.success(data)
  }
}
