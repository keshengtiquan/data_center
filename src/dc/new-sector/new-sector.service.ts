import {Inject, Injectable} from '@nestjs/common';
import {CreateNewSectorDto} from "./dto/create-new-sector.dto";
import {PrismaService} from "../../prisma1/prisma.service";
import {ClsService} from "nestjs-cls";
import {User} from "@prisma/client";
import {UpdatePathDto} from "./dto/update-path.dto";
import {PageDto} from "./dto/page.dto";
import {CreateSectionDivisionDto} from "./dto/create-section-division.dto";

@Injectable()
export class NewSectorService {
  
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;
  
  async create(createNewSectorDto: CreateNewSectorDto) {
    const userInfo = this.cls.get('headers').user as User;
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const {sectorName,path,workPlaces,color,whetherInclude,workPlaceNames} = createNewSectorDto
    const sectionNames = this.createStationPairs(workPlaceNames)
    const sectionList = await this.prisma.workPlace.findMany({
      where: {
        tenantId,
        deleteflag: 0,
        workPlaceName: {
          in: sectionNames
        }
      }
    })
    const sectionIds = sectionList.map(item => item.id)
    if(!whetherInclude[0]) {
      workPlaces.shift()
    }
    if(!whetherInclude[1]) {
      workPlaces.pop()
    }
    const newWorkPlace = workPlaces.concat(sectionIds)
    
    return await this.prisma.newSector.create({
      data: {
        sectorName,
        path,
        color,
        workPlaces: JSON.stringify(newWorkPlace),
        tenantId,
        createBy: userInfo.userName,
        updateBy: userInfo.userName
      }
    })
  }
  createStationPairs(stations: string[]){
    const result = [];
    for (let i = 0; i < stations.length - 1; i++) {
      result.push(`${stations[i]}-${stations[i + 1]}`);
    }
    return result;
  }
  
  async list() {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return await this.prisma.newSector.findMany({
      where: {
        tenantId,
        deleteflag: 0
      }
    })
  }
  
  async updatePath(updatePathDto: UpdatePathDto) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    return await this.prisma.newSector.updateMany({
      where: {
        sectorName: updatePathDto.sectorName,
        tenantId
      },
      data: {
        path: updatePathDto.path
      }
    })
  }
  
  async page(pageDto: PageDto) {
    const {current, pageSize} = pageDto
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    
    const condition = {
      tenantId,
      deleteflag: 0
    }
    
    const list = await this.prisma.newSector.findMany({
      where: condition,
      skip: (current - 1) * pageSize,
      take: pageSize
    })
    const workPlaceId = new Set<number>()
    const ids = []
    list.forEach(item => {
      JSON.parse(item.workPlaces).forEach(id => {
        workPlaceId.add(id)
      })
      ids.push(item.id)
    })
    const workPlaceNames = await this.prisma.workPlace.findMany({
      where: {
        id: {
          in: [...workPlaceId]
        }
      }
    })
  
    const res = list.map(item => {
      const workPlaceName = []
      JSON.parse(item.workPlaces).forEach(id => {
        const workPlace = workPlaceNames.find(w => w.id === id)
        workPlaceName.push(workPlace.workPlaceName)
      })
      return {
        ...item,
        workPlaceName
      }
    })
    return {
      results: res,
      total: await this.prisma.newSector.count({where: condition}),
      current,
      pageSize
    }
    
  }
  
  async addSectionDivision(createSectionDivisionDto: CreateSectionDivisionDto[]) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const deptIds = createSectionDivisionDto.map(item => item.deptId)
    const divisionIds = createSectionDivisionDto.map(item => item.division.map(ele => ele)).flat()
    const deptNames = await this.prisma.dept.findMany({where: {deleteflag: 0,tenantId, id: {in: deptIds}},select: {id: true, deptName:true}})
    const divisionNames = await this.prisma.division.findMany({where: {deleteflag: 0, tenantId, id: {in: divisionIds}}, select: {id: true, divisionName: true}})
    const createData = []
    // console.log(createSectionDivisionDto)
    createSectionDivisionDto.forEach(item => {
      item.division.forEach(ele => {
        const obj = {}
        // console.log(ele)
        const find = divisionNames.find(d => d.id === ele)
        obj['divisionId'] = ele
        obj['divisionName'] = find.divisionName
        const dept = deptNames.find(d => d.id === item.deptId)
        obj['deptId'] = item.deptId
        obj['deptName'] = dept.deptName
        obj['sectorId'] = item.sectorId
        obj['tenantId'] = tenantId
        createData.push(obj)
      })
    })
    console.log(createData)
    return this.prisma.$transaction(async (prisma) => {
      await prisma.sectorDivision.deleteMany({
        where: {
          sectorId: createSectionDivisionDto[0].sectorId
        }
      })
      return await prisma.sectorDivision.createMany({
        data: createData
      })
    })
  }
  
  async getSectorDivision(sectorId: number) {
    const tenantId = +this.cls.get('headers').headers['x-tenant-id'];
    const sectorDivision = await this.prisma.sectorDivision.findMany({
      where: {
        sectorId,
        tenantId,
      },
      select: {
        sectorId: true,
        divisionId: true,
        deptId: true,
      }
    })
    const grouped = sectorDivision.reduce((acc, item) => {
      const { deptId, sectorId, divisionId } = item;
      
      if (!acc[deptId]) {
        acc[deptId] = {
          deptId: deptId,
          sectorId: sectorId,
          division: []
        };
      }
      
      acc[deptId].division.push(divisionId);
      
      return acc;
    }, {});
    return Object.values(grouped)
  }
  
  
  async deleteSector(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      
      await prisma.sectorDivision.deleteMany({
        where: {
          sectorId: id
        }
      })
      return await prisma.newSector.delete({
        where: {id}
      })
    })
  }
}
