/* eslint-disable */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MovementSchema } from 'src/schemas/movement.schema';
import { MovementController } from './movements.controller';
import { MovementService } from './movements.service';
import { SubOfficeModule } from '../sub_office/sub_office.module';
import { UsersModule } from '../users/users.module';
import { CurrencyModule } from '../currency/currency.module';
import { CashRegisterModule } from '../cash_register/cash-register.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Movement', schema: MovementSchema }]),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => UsersModule),
    forwardRef(() => CurrencyModule),
    forwardRef(() => CashRegisterModule),
  ],
  controllers: [MovementController],
  providers: [MovementService],
  exports: [MovementService],
})
export class MovementModule {}
