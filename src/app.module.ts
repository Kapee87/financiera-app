/* eslint-disable */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { OfficeModule } from './modules/office/office.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { CashRegister } from './schemas/cash_registers.schema';
import { SubOfficeModule } from './modules/sub_office/sub_office.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URI'),
        dbName: 'FinancieraDb',
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    TransactionModule,
    OfficeModule,
    CurrencyModule,
    CashRegister,
    SubOfficeModule,
    ExpenseModule,
    ClientsModule,
  ],
  exports: [MongooseModule],
})
export class AppModule {}
