/* eslint-disable */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { SubOfficeModule } from '../sub_office/sub_office.module';
import { CurrencyModule } from '../currency/currency.module';
import { CashRegisterModule } from '../cash_register/cash-register.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    forwardRef(() => SubOfficeModule),
    CurrencyModule,
    CashRegisterModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
