/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { SubOffice } from './sub_office.schema';
import { Currency } from './currency.schema';

// Definimos el tipo TransactionDocument, que es Transaction + Document de Mongoose
export type TransactionDocument = Transaction & Document;

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

// Usamos SchemaFactory para crear el esquema
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
