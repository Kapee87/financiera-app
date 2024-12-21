/* eslint-disable */
/**
 * DTO para crear una caja de dinero
 *
 * Contiene los datos necesarios para crear una caja de dinero
 *
 * @property {Date} date - Fecha en la que se crea la caja de dinero
 * @property {Number} opening_balance - Monto inicial de la caja de dinero
 * @property {ObjectId} sub_office - Suboficina a la que pertenece la caja de dinero
 */
import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsObject,
  isObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prop } from '@nestjs/mongoose';

export class CreateCashRegisterDto {
  /**
   * Fecha en la que se crea la caja de dinero
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  /**
   * Monto inicial de la caja de dinero
   */
  @Type(() => Number)
  @IsNumber()
  opening_balance: number;

  /**
   * Suboficina a la que pertenece la caja de dinero
   */
  @IsMongoId()
  sub_office: string;

  /**
   * Tasas de cambio de la caja de dinero
   */
  @IsObject()
  rates: { usd: number; ars: number };
}
