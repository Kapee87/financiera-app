/* eslint-disable */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CashRegisterController } from './cash-register.controller';

import { SubOffice, SubOfficeSchema } from 'src/schemas/sub_office.schema';
import {
  CashRegister,
  CashRegisterSchema,
} from 'src/schemas/cash_registers.schema';
import { CashRegisterService } from './cash_register.service';
import { CurrencyModule } from '../currency/currency.module';
import { SubOfficeModule } from '../sub_office/sub_office.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashRegister.name, schema: CashRegisterSchema },
      { name: SubOffice.name, schema: SubOfficeSchema },
    ]),
    forwardRef(() => CurrencyModule),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => TransactionModule),
  ],
  providers: [CashRegisterService],
  controllers: [CashRegisterController],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
