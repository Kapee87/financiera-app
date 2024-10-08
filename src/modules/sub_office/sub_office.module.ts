/* eslint-disable */
/**
 * Módulo de suboficinas
 *
 * Contiene la lógica para manejar las suboficinas
 *
  Juan Carlos Gonzalez Ibarra
 * @since 2022-03-04
 */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubOffice, SubOfficeSchema } from 'src/schemas/sub_office.schema';
import { SubOfficeController } from './sub_office.controller';
import { SubOfficeService } from './sub_office.service';
import { TransactionModule } from '../transaction/transaction.module';
import { CurrencyModule } from '../currency/currency.module';
import { OfficeModule } from '../office/office.module';

@Module({
  imports: [
    /**
     * Importamos el módulo de mongoose para que podamos utilizar el esquema de suboficinas
     */
    MongooseModule.forFeature([
      { name: SubOffice.name, schema: SubOfficeSchema },
    ]),
    /**
     * Importamos el módulo de transacciones para que podamos utilizar los servicios de transacciones
     */
    forwardRef(() => TransactionModule),
    /**
     * Importamos el módulo de monedas para que podamos utilizar los servicios de monedas
     */
    forwardRef(() => CurrencyModule),
    /**
     * Importamos el módulo de oficinas para que podamos utilizar los servicios de oficinas
     */
    forwardRef(() => OfficeModule),
  ],
  controllers: [SubOfficeController],
  providers: [SubOfficeService],
  exports: [SubOfficeService],
})
export class SubOfficeModule {}
