/* eslint-disable */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Balance } from 'src/schemas/balance.schema';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { CurrencyModule } from '../currency/currency.module';
import { SubOfficeModule } from '../sub_office/sub_office.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CashRegisterModule } from '../cash_register/cash-register.module';
import { MovementModule } from '../movements/movements.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Balance',
        schema: Balance,
      },
    ]),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => CurrencyModule),
    forwardRef(() => TransactionModule),
    forwardRef(() => MovementModule),
    forwardRef(() => CashRegisterModule),
  ],
  controllers: [BalanceController],
  providers: [BalanceService],
  exports: [],
})
export class BalanceModule {}
