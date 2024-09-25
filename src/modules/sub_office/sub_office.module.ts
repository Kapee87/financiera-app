/* eslint-disable */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubOffice, SubOfficeSchema } from 'src/schemas/sub_office.schema';
import { SubOfficeController } from './sub_office.controller';
import { SubOfficeService } from './sub_office.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubOffice.name, schema: SubOfficeSchema },
    ]),
  ],
  controllers: [SubOfficeController],
  providers: [SubOfficeService],
  exports: [SubOfficeService],
})
export class SubOfficeModule {}
