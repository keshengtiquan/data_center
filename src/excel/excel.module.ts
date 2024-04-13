import { Global, Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';

@Global()
@Module({
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService]
})
export class ExcelModule {}
