/* eslint-disable */
/**
 * Esquema de la colección de registros de caja de la empresa
 *
 * Contiene la información de los registros de caja de la empresa
 *
 * @property {ObjectId} _id - Identificador único del registro de caja
 * @property {Date} date - Fecha en la que se realizó el registro de caja
 * @property {number} total_opening_balance - Monto total de la apertura de la caja
 * @property {number} total_closing_balance - Monto total del cierre de la caja
 * @property {number} total_income - Monto total de los ingresos
 * @property {number} total_expenses - Monto total de los gastos
 * @property {number} difference - Diferencia entre el monto total de la apertura y el monto total del cierre
 * @property {ObjectId[]} subOfficeCashRegisters - Arreglo de identificadores de los registros de caja de las suboficinas
 */
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
