/* eslint-disable */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubOffice, SubOfficeSchema } from 'src/schemas/sub_office.schema';
import { SubOfficeController } from './sub_office.controller';
import { SubOfficeService } from './sub_office.service';
import { TransactionModule } from '../transaction/transaction.module';
import { CurrencyModule } from '../currency/currency.module';
import { OfficeModule } from '../office/office.module';
import { CurrencyService } from '../currency/currency.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubOffice.name, schema: SubOfficeSchema },
    ]),
    forwardRef(() => TransactionModule),
    forwardRef(() => CurrencyModule),
    forwardRef(() => OfficeModule),
  ],
  controllers: [SubOfficeController],
  providers: [SubOfficeService],
  exports: [SubOfficeService],
})
export class SubOfficeModule {}
