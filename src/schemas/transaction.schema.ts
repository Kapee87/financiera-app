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

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  subOffice: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  sourceCurrency: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  targetCurrency: Types.ObjectId;

  @Prop({ type: Number, required: true })
  sourceAmount: number;

  @Prop({ type: Number, required: true })
  targetAmount: number;

  @Prop({ type: Number })
  exchange_rate: number; // Tasa de cambio distinta a la seteada en la moneda - opcional | falta implementar método -

  @Prop({ type: Number })
  commission?: number; //Comisión en caso de cheque - opcional -

  @Prop({ enum: ['buy', 'sell', 'check'], required: true })
  type: string;
}

// Usamos SchemaFactory para crear el esquema
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
