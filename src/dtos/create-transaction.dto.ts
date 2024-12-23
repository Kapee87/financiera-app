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
 * @property {string} type - Tipo de transacción (Compra, Venta, Cambio de cheques)
 * @property {number} amount - Monto de la transacción
 * @property {number} exchangeRate - Tasa de cambio de la moneda (opcional)
 * @property {number} commission - Comisión de la transacción (opcional)
 * @property {string} checkNumber - Número de cheque (opcional, solo para transacciones de tipo "Cambio de cheque")
 * @property {Date} Cambio de chequeDueDate - Fecha de vencimiento del cheque (opcional, solo para transacciones de tipo "Cambio de cheque")
 * @property {string} bankName - Nombre del banco (opcional, solo para transacciones de tipo "Cambio de cheque")
 */
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsString,
  IsDate,
  ValidateIf,
  IsDateString,
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

  @IsEnum(['Compra', 'Venta', 'Cambio de cheque'], {
    message:
      'El tipo de transacción debe ser "Compra", "Venta" o "Cambio de cheque"',
  })
  type: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  // Campos para cheques
  @ValidateIf((o) => o.type === 'Cambio de cheque')
  @IsString()
  @IsNotEmpty()
  checkNumber?: string;

  @ValidateIf((o) => o.type === 'Cambio de cheque')
  @IsDateString()
  checkDueDate?: String;

  @ValidateIf((o) => o.type === 'Cambio de cheque')
  @IsString()
  @IsNotEmpty()
  bankName?: string;
}
