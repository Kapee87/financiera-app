/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Currency {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string; // Nombre de la moneda (ej. Dólar, Euro)

  @Prop({ required: true })
  code: string; // Código de la moneda (ej. USD, EUR)

  @Prop({
    required: true,
    default: 0,
  })
  globalStock: number; // Stock global en la empresa

  @Prop({
    required: true,
  })
  exchangeRate: number; // Tasa actual en relación con el peso ARS
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
/* eslint-disable */
