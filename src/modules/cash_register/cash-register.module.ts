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
import { Movement, MovementSchema } from 'src/schemas/movement.schema';
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema';
import { BalanceModule } from '../balance/balance.module';
import { BalanceService } from '../balance/balance.service';
import { Balance, BalanceSchema } from 'src/schemas/balance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CashRegister.name, schema: CashRegisterSchema },
      { name: SubOffice.name, schema: SubOfficeSchema },
      { name: Movement.name, schema: MovementSchema },
      { name: Transaction.name, schema: TransactionSchema },
      {name: Balance.name, schema: BalanceSchema}

    ]),
    forwardRef(() => CurrencyModule),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => TransactionModule),
    forwardRef(() => BalanceModule),
  ],
  providers: [CashRegisterService],
  controllers: [CashRegisterController],
  exports: [CashRegisterService],
})
export class CashRegisterModule {}
