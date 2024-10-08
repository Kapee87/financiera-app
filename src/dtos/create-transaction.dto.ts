/* eslint-disable */
/**
 * DTO para crear una transacción
 *
 * Contiene los datos necesarios para crear una transacción
 *
 * @property {ObjectId} user - Identificador del usuario que realiza la transacción
 * @property {ObjectId} subOffice - Identificador de la suboficina en la que se realiza la transacción
 * @property {ObjectId} sourceCurrency - Identificador de la moneda fuente de la transacción
 * @property {ObjectId} targetCurrency - Identificador de la moneda destino de la transacción
 * @property {string} type - Tipo de transacción (buy, sell, check)
 * @property {number} amount - Monto de la transacción
 * @property {number} exchangeRate - Tasa de cambio de la moneda (opcional)
 * @property {number} commission - Comisión de la transacción (opcional)
 */
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateTransactionDto {
  @IsMongoId()
  user: Types.ObjectId;

  @IsMongoId()
  subOffice: Types.ObjectId;

  @IsMongoId()
  sourceCurrency: Types.ObjectId;

  @IsMongoId()
  targetCurrency: Types.ObjectId;

  @IsEnum(['buy', 'sell', 'check'])
  type: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsNumber()
  @IsOptional()
  commission?: number;
}
