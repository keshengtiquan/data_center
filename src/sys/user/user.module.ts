import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CompanyDeptModule } from '../company-dept/company-dept.module';

@Module({
  imports: [CompanyDeptModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
