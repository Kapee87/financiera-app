/* eslint-disable */
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class CashRegister {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  opening_balance: number;

  @Prop({ type: Number, required: true })
  closing_balance: number;

  @Prop({ type: Number, required: true })
  total_income: number;

  @Prop({ type: Number, required: true })
  total_expenses: number;

  @Prop({ type: Number, required: true })
  difference: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  sub_office: string;
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);
