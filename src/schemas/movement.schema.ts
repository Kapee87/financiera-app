/* eslint-disable */
/**
 * Esquema de movimientos
 *
 * Contiene la información de cada movimiento realizado en la empresa, fuera de las transacciones
 *
 * @property {ObjectId} id - Identificador único del movimiento
 * @property {Date} date - Fecha en la que se realizó el movimiento
 * @property {Number} amount - Monto del movimiento
 * @property {String} description - Descripción del movimiento
 * @property {String} type - Tipo de movimiento (ingreso, egreso, etc.)
 * @property {ObjectId} user - Usuario que realizó el movimiento
 * @property {ObjectId} sub_office - Sucursal en la que se realizó el movimiento
 * @property {ObjectId} currency - Moneda en la que se realizó el movimiento
 * 
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MovementDocument = Movement & Document;

@Schema({
  timestamps: true,
})
export class Movement {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ingreso', 'egreso'],
  })
  category: 'ingreso' | 'egreso';

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: string;

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  sub_office: string;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  currency: string;
}

export const MovementSchema = SchemaFactory.createForClass(Movement);
