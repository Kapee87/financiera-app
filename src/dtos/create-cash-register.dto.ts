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
import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class CreateCashRegisterDto {
  /**
   * Fecha en la que se crea la caja de dinero
   */
  @Prop({ type: Date, required: true })
  date: Date;

  /**
   * Monto inicial de la caja de dinero
   */
  @Prop({ type: Number, required: true })
  opening_balance: number;

  /**
   * Suboficina a la que pertenece la caja de dinero
   */
  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  sub_office: string;
}
