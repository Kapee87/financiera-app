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
 * @property {string} type - Tipo de transacción (buy, sell o exchange)
 */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Definimos el tipo TransactionDocument, que es Transaction + Document de Mongoose
export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: true,
})
export class Transaction {
  /**
   * Identificador del usuario que realizó la transacción
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  /**
   * Nombre del usuario que realizó la transacción
   */
  @Prop({ required: true })
  userName: string;

  /**
   * Identificador de la sucursal en la que se realizó la transacción
   */
  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  subOffice: Types.ObjectId;

  /**
   * Nombre de la sucursal en la que se realizó la transacción
   */
  @Prop({ required: true })
  subOfficeName: string;

  /**
   * Identificador de la moneda origen de la transacción
   */
  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  sourceCurrency: Types.ObjectId;

  /**
   * Código de la moneda origen de la transacción
   */
  @Prop({ required: true })
  sourceCurrencyCode: string;

  /**
   * Identificador de la moneda destino de la transacción
   */
  @Prop({ type: Types.ObjectId, ref: 'Currency', required: true })
  targetCurrency: Types.ObjectId;

  /**
   * Código de la moneda destino de la transacción
   */
  @Prop({ required: true })
  targetCurrencyCode: string;

  /**
   * Monto de la transacción en la moneda origen
   */
  @Prop({ type: Number, required: true })
  sourceAmount: number;

  /**
   * Monto de la transacción en la moneda destino
   */
  @Prop({ type: Number, required: true })
  targetAmount: number;

  /**
   * Tasa de cambio de la transacción
   */
  @Prop({ type: Number, required: true })
  exchangeRate: number;

  /**
   * Comisión de la transacción (opcional)
   */
  @Prop({ type: Number })
  commission?: number;

  /**
   * Tipo de transacción (buy, sell o exchange)
   */
  @Prop({ enum: ['buy', 'sell', 'exchange'], required: true })
  type: string;
}

// Usamos SchemaFactory para crear el esquema
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
