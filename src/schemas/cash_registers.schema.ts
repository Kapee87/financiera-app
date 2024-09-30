/* eslint-disable */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type CashRegisterDocument = CashRegister & Document;

@Schema()
export class CashRegister {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  opening_balance: number;

  @Prop({ type: Number, required: false, default: 0 }) // Cambiado a no requerido
  closing_balance: number;

  @Prop({ type: Number, required: false, default: 0 }) // Cambiado a no requerido
  total_income: number;

  @Prop({ type: Number, required: false, default: 0 }) // Cambiado a no requerido
  total_expenses: number;

  @Prop({ type: Number, required: false }) // Cambiado a no requerido
  difference: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  sub_office: string;
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);
