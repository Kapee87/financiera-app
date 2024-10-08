/* eslint-disable */
/**
 * Módulo de oficinas
 *
 * Este módulo contiene la lógica para manejar las oficinas
 *
 * @module OfficeModule
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { Office, OfficeSchema } from 'src/schemas/office.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema }]),
  ],
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
})
export class OfficeModule {}
