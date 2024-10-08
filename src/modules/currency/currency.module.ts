/* eslint-disable */
/**
 * Módulo para la gestión de Monedas
 *
 * Contiene la configuración para el uso del esquema de Monedas
 * y los servicios y controladores necesarios para interactuar con él
 *
  
 * @version 1.0.0
 * @since 2020-07-20
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Currency, CurrencySchema } from 'src/schemas/currency.schema';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
