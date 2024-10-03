/* eslint-disable */
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
  user: Types.ObjectId; // ID del usuario que realiza la transacción

  @IsMongoId()
  subOffice: Types.ObjectId; // ID de la sub-agencia

  @IsMongoId()
  sourceCurrency: Types.ObjectId; // ID de la moneda de origen

  @IsMongoId()
  targetCurrency: Types.ObjectId; // ID de la moneda de destino

  @IsEnum(['buy', 'sell', 'check'])
  type: string; // Tipo de transacción: 'buy', 'sell' o 'check'

  @IsNumber()
  sourceAmount: number; // Cantidad de moneda de origen

  @IsNumber()
  targetAmount: number; // Cantidad de moneda de destino

  @IsNumber()
  @IsOptional()
  exchangeRate?: number; // Tasa de cambio (opcional, dependiendo del tipo de transacción)

  @IsNumber()
  @IsOptional()
  commission?: number; // Comisión en caso de que la transacción sea un cheque (opcional)
}
