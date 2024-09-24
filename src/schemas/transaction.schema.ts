/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { User } from './user.schema';
import { SubOffice } from './sub_office.schema';
import { Currency } from './currency.schema';

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  subOffice: SubOffice;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  currency: Currency;

  @Prop({ enum: ['buy', 'sell', 'check'], required: true })
  type: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number })
  exchange_rate: number;

  @Prop({ type: Number })
  commission: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
/* eslint-disable */
