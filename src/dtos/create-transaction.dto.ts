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
  @IsNotEmpty()
  user: Types.ObjectId; // ID del usuario que realiza la transacción

  @IsMongoId()
  @IsNotEmpty()
  subOffice: Types.ObjectId; // ID de la sub-agencia

  @IsMongoId()
  @IsNotEmpty()
  currency: Types.ObjectId; // ID de la moneda

  @IsEnum(['buy', 'sell', 'check'])
  @IsNotEmpty()
  type: string; // Tipo de transacción: 'buy', 'sell' o 'check'

  @IsNumber()
  @IsNotEmpty()
  amount: number; // Cantidad de moneda en la transacción

  @IsNumber()
  @IsOptional()
  exchange_rate?: number; // Tasa de cambio (opcional, dependiendo del tipo de transacción)

  @IsNumber()
  @IsOptional()
  commission?: number; // Comisión en caso de que la transacción sea un cheque (opcional)
}
