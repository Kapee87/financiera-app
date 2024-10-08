/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Definimos el tipo TransactionDocument, que es Transaction + Document de Mongoose
export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  subOffice: Types.ObjectId;

  @Prop({ required: true })
  subOfficeName: string;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  sourceCurrency: Types.ObjectId;

  @Prop({ required: true })
  sourceCurrencyCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  targetCurrency: Types.ObjectId;

  @Prop({ required: true })
  targetCurrencyCode: string;

  @Prop({ type: Number, required: true })
  sourceAmount: number;

  @Prop({ type: Number, required: true })
  targetAmount: number;

  @Prop({ type: Number, required: true })
  exchangeRate: number;

  @Prop({ type: Number })
  commission?: number;

  @Prop({ enum: ['buy', 'sell', 'exchange'], required: true })
  type: string;
}

// Usamos SchemaFactory para crear el esquema
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
