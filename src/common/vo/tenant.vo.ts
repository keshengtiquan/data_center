export class TenantVo {
  id: number;
  contactUserName: string;
  contactPhone: string;
  companyName: string;
  status: string;
  createBy: string;
  updateBy: string;
  createTime: Date;
  updateTime: Date;
  deleteflag: number;
  packageId: number;
  projectName: string;
  projectAddress: string;
  manager: number;
  chiefEngineer: number;
  safetyDirector: number;
  startDate: string;
  endDate: string;
  projectNature: string;
  area: string;
  developmentOrganization: string;
  developContact: string;
  developAddress: string;
  developTel: string;
  designOrganization: string;
  designContact: string;
  designAddress: string;
  designTel: string;
  supervisorOrganization: string;
  supervisorContact: string;
  supervisorAddress: string;
  supervisorTel: string;
  companyDeptId: number;
  projectLocation: string;
  areaLeader: number;
  projectType: string;
  projectProfessional: string;
  contract: string;
  tenantPackage: TenantPackageVo;

  constructor(data: Partial<TenantVo>) {
    Object.assign(this, data);
  }
}

export class TenantPackageVo {
  id: number;
  packageName: string;
  remark: string;
  menuIds: string;
  status: string;
  createBy: string;
  updateBy: string;
  createTime: Date;
  updateTime: Date;
  deleteflag: number;
}
