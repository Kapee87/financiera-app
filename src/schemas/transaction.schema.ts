/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  userId: string; // Referencia al usuario que realiza la transacción

  @Prop({
    required: true,
  })
  type: string; // Tipo de transacción (compra/venta/cambio de cheques)

  @Prop({
    required: true,
  })
  currency: string; // Moneda utilizada

  @Prop({
    required: true,
  })
  amount: number; // Monto de la transacción

  @Prop({
    type: Number,
    required: false,
  })
  exchangeRate?: number; // Tasa de cambio (opcional)

  @Prop({
    type: Number,
    required: true,
  })
  commission: number; // Comisión aplicada a la transacción

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  officeId: string; // Referencia a la sucursal donde se realizó la transacción
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
/* eslint-disable */
