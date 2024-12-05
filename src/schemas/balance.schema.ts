/* eslint-disable */
/* eslint-disable */

/**
 * Esquema de balance
 *
 * Contiene la información del balance de una moneda en una sucursal
 *
 * @property {ObjectId} _id - Identificador único del balance
 * @property {ObjectId} subOffice - Suboficina a la que pertenece el balance
 * @property {ObjectId} currency - Moneda del balance
 * @property {number} amount - Cantidad de la moneda en la sucursal
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BalanceDocument = Balance & Document;

@Schema({
  timestamps: true,
})
export class Balance {
  @Prop({ type: Types.ObjectId })
  _id: string;

  @Prop({ type: Types.ObjectId, required: true })
  subOffice: string;

  @Prop({ type: Types.ObjectId, required: true })
  currency: string;

  @Prop({ type: Number, default: 0 })
  amount: number;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
