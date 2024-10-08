/* eslint-disable */
/**
 * Esquema de la colección de cajas de dinero
 *
 * Representa una caja de dinero de una suboficina en un día en particular
 *
 * @name CashRegister
 * @collection cash_registers
 *
 * @property {Date} date - Fecha en la que se realizó el cierre de la caja
 * @property {Number} opening_balance - Monto inicial de la caja
 * @property {Number} closing_balance - Monto final de la caja
 * @property {Number} total_income - Monto total de ingresos
 * @property {Number} total_expenses - Monto total de egresos
 * @property {Number} difference - Diferencia entre el monto final y el monto inicial
 * @property {ObjectId} sub_office - Suboficina a la que pertenece la caja
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type CashRegisterDocument = CashRegister & Document;

@Schema()
export class CashRegister {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  opening_balance: number;

  @Prop({ type: Number, required: false, default: 0 })
  closing_balance: number;

  @Prop({ type: Number, required: false, default: 0 })
  total_income: number;

  @Prop({ type: Number, required: false, default: 0 })
  total_expenses: number;

  @Prop({ type: Number, required: false })
  difference: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  sub_office: Types.ObjectId;
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);
