/* eslint-disable */
/* eslint-disable */

/**
 * Esquema de balance
 *
 * Contiene la información del balance de una moneda en una sucursal
 *
 * @property {ObjectId} _id - Identificador único del balance
 * @property {ObjectId} subOffice - Suboficina a la que pertenece el balance
 * @property {ObjectId} currency - Moneda del balance
 * @property {number} amount - Cantidad de la moneda en la sucursal
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BalanceDocument = Balance & Document;

@Schema({
  timestamps: true,
})
export class Balance {
  @Prop({ type: Types.ObjectId, required: true })
  subOffice: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  //INGRESOS
  @Prop({ type: Number, default: 0 })
  totalIncomeUSD: number;
  //EGRESOS
  @Prop({ type: Number, default: 0 })
  totalExpensesUSD: number;
  //TOTAL GANANCIA TRANSACCIONES(Lo que decía matias de apertura y cierre de caja pero sin meter a la caja de por medio, eso en la caja se maneja con el total de todas las operaciones incluyendo movimientos)
  @Prop({ type: Number, default: 0 })
  transactionsProfit: number;
  //Stock total de todas las monedas convertido a dolar
  @Prop({ type: Number, default: 0 })
  currentStockUSD: number;
  //Ganancia total (ingresos + transacciones - egresos)
  @Prop({ type: Number, default: 0 })
  totalProfit: number;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
