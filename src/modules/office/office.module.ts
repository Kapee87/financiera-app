/* eslint-disable */
/**
 * Módulo de oficinas
 *
 * Este módulo contiene la lógica para manejar las oficinas
 *
 * @module OfficeModule
 */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { Office, OfficeSchema } from 'src/schemas/office.schema';
import { SubOfficeModule } from '../sub_office/sub_office.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema }]),
    forwardRef(() => SubOfficeModule),
    forwardRef(() => CurrencyModule),
  ],
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
})
export class OfficeModule {}
