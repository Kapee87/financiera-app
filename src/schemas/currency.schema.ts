/* eslint-disable */
/**
 * Esquema de monedas
 *
 * Contiene la información de las monedas que se manejan en la empresa
 *
 * @property {ObjectId} _id - Identificador único de la moneda
 * @property {String} name - Nombre de la moneda
 * @property {String} code - Código de la moneda
 * @property {Number} exchangeRate - Tasa de cambio de la moneda con respecto al dólar
 */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Currency {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({
    required: true,
  })
  exchangeRate: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPrimaryCurrency: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
/* eslint-disable */
