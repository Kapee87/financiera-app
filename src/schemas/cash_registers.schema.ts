/* eslint-disable */
/**
 * Esquema de la colección de cajas de dinero
 *
 * Representa una caja de dinero de una suboficina en un día en particular
 *
 * @name CashRegister
 * @collection cash_registers
 *
 * @property {Date} date - Fecha en la que se realizó el cierre de la caja
 * @property {Number} opening_balance - Monto inicial de la caja
 * @property {Number} closing_balance - Monto final de la caja
 * @property {Number} total_income - Monto total de ingresos
 * @property {Number} total_expenses - Monto total de egresos
 * @property {Number} check_income - Monto total de ingresos por cheques
 * @property {Number} difference - Diferencia entre el monto final y el monto inicial
 * @property {ObjectId} sub_office - Suboficina a la que pertenece la caja
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CashRegisterDocument = CashRegister & Document;

@Schema({ timestamps: true })
export class CashRegister {
  @Prop({
    type: Date,
    required: true,
    set: (date: any) => {
      if (typeof date === 'string') {
        // Asegurarse de que la fecha string esté en formato ISO
        return new Date(date + 'T00:00:00.000Z');
      }
      return date;
    },
    get: (date: Date) => {
      if (date) {
        return new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
          ),
        );
      }
      return date;
    },
  })
  date: Date;

  @Prop({ required: true, type: Number })
  opening_balance: number;

  @Prop({ type: Number, default: null })
  closing_balance: number;

  @Prop({ type: Number, default: 0 })
  total_income: number;

  @Prop({ type: Number, default: 0 })
  total_expenses: number;

  @Prop({ type: Number, default: 0 })
  check_income: number;

  @Prop({ type: Number, default: 0 })
  difference: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'SubOffice' })
  sub_office: Types.ObjectId;

  @Prop({
    type: {
      usd: Number,
      ars: Number,
    },
    default: { usd: 0, ars: 1 },
  })
  rates: { usd: number; ars: number };
}

export const CashRegisterSchema = SchemaFactory.createForClass(CashRegister);
