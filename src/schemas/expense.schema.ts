/* eslint-disable */
/**
 * Esquema de gastos
 *
 * Contiene la información de cada gasto realizado en la empresa
 *
 * @property {ObjectId} id - Identificador único del gasto
 * @property {Date} date - Fecha en la que se realizó el gasto
 * @property {Number} amount - Monto del gasto
 * @property {String} description - Descripción del gasto
 * @property {String} type - Tipo de gasto (ingreso, egreso, etc.)
 * @property {ObjectId} account - Cuenta en la que se realizó el gasto
 * @property {ObjectId} sub_office - Sucursal en la que se realizó el gasto
 */
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

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  account: string;

  @Prop({ type: Types.ObjectId, ref: 'SubOffice', required: true })
  sub_office: SubOffice;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

