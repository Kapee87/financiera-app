/* eslint-disable */
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class CompanyCashRegister {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true, precision: 10, scale: 2 })
  total_opening_balance: number;

  @Prop({ type: Number, required: true, precision: 10, scale: 2 })
  total_closing_balance: number;

  @Prop({ type: Number, required: true, precision: 10, scale: 2 })
  total_income: number;

  @Prop({ type: Number, required: true, precision: 10, scale: 2 })
  total_expenses: number;

  @Prop({ type: Number, required: true, precision: 10, scale: 2 })
  difference: number;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'CashRegister', required: true })
  subOfficeCashRegisters: string[];
}

export const CompanyCashRegisterSchema =
  SchemaFactory.createForClass(CompanyCashRegister);
