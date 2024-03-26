import { Module } from '@nestjs/common';
import { CompanyDeptService } from './company-dept.service';
import { CompanyDeptController } from './company-dept.controller';

@Module({
  controllers: [CompanyDeptController],
  providers: [CompanyDeptService],
  exports: [CompanyDeptService],
})
export class CompanyDeptModule {}
