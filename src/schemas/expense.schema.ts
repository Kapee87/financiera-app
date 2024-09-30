/* eslint-disable */
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SubOffice } from './sub_office.schema';

export class Expense {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Account' }) //Hay que crear el modulo de clientes tmb.
  account: string;

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  sub_office: SubOffice;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
