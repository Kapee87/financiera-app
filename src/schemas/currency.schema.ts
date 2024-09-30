/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Currency {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  name: string; // Nombre de la moneda (ej. Dólar, Euro)

  @Prop({ required: true })
  code: string; // Código de la moneda (ej. USD, EUR)

  @Prop({
    required: true,
  })
  exchangeRate: number; // Tasa actual en relación con otras monedas

  @Prop({
    required: true,
    default: 0,
  })
  globalStock: number; // Stock global en la empresa
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
/* eslint-disable */
