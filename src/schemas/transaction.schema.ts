/* eslint-disable */
/**
 * Esquema de transacciones
 *
 * Contiene la información de cada transacción realizada en el sistema
 *
 * @property {ObjectId} user - Identificador del usuario que realizó la transacción
 * @property {string} userName - Nombre del usuario que realizó la transacción
 * @property {ObjectId} subOffice - Identificador de la sucursal en la que se realizó la transacción
 * @property {string} subOfficeName - Nombre de la sucursal en la que se realizó la transacción
 * @property {ObjectId} sourceCurrency - Identificador de la moneda origen de la transacción
 * @property {string} sourceCurrencyCode - Código de la moneda origen de la transacción
 * @property {ObjectId} targetCurrency - Identificador de la moneda destino de la transacción
 * @property {string} targetCurrencyCode - Código de la moneda destino de la transacción
 * @property {number} sourceAmount - Monto de la transacción en la moneda origen
 * @property {number} targetAmount - Monto de la transacción en la moneda destino
 * @property {number} exchangeRate - Tasa de cambio de la transacción
 * @property {number} [commission] - Comisión de la transacción (opcional)
 * @property {string} type - Tipo de transacción (buy, sell, exchange, check)
 * @property {string} [checkNumber] - Número de cheque (opcional)
 * @property {Date} [checkDueDate] - Fecha de vencimiento del cheque (opcional)
 * @property {string} [bankName] - Nombre del banco (opcional)
 * @property {number} [checkCommission] - Comisión de cheque (opcional)
 * @property {Date} createdAt - Fecha de creación de la transacción
 * * @property {string} type - Tipo de transacción (buy, sell o exchange)
 */
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

  @Prop({ enum: ['buy', 'sell', 'exchange', 'check'], required: true })
  type: string;

  @Prop({
    type: Number,
  })
  profit: number;

  @Prop({
    type: String,
    required: function () {
      return this.type === 'check';
    },
  })
  checkNumber?: string;

  @Prop({
    type: Date,
    required: function () {
      return this.type === 'check';
    },
  })
  checkDueDate?: Date;

  @Prop({
    type: String,
    required: function () {
      return this.type === 'check';
    },
  })
  bankName?: string;

  @Prop({ type: Number })
  checkCommission?: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

// Usamos SchemaFactory para crear el esquema
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
