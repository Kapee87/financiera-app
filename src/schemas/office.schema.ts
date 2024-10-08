/* eslint-disable */
/**
 * Esquema de la colección de oficinas
 *
 * La oficina es la unidad principal de la empresa, cada oficina tiene
 * varias sub oficinas que pertenecen a ella.
 *
 * @name Office
 * @collection offices
 *
 * @property {string} name - Nombre de la oficina
 *
 * @property {string} address - Dirección de la oficina
 *
 * @property {ObjectId[]} sub_offices - Sub oficinas que pertenecen a esta oficina
 *
 * @property {number} globalStock - Cantidad disponible de la moneda total(en dólares)
 *
 * La cantidad disponible de la moneda total es la suma de la cantidad
 * disponible en todas las sub oficinas.
 */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Office {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  /**
   * Nombre de la oficina
   */
  @Prop({ required: true })
  name: string;

  /**
   * Dirección de la oficina
   */
  @Prop({ required: true })
  address: string;

  /**
   * Sub oficinas que pertenecen a esta oficina
   */
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'SubOffice', required: true })
  sub_offices: string[];

  /**
   * Cantidad disponible de la moneda total(en dólares)
   */
  @Prop({
    required: true,
    default: 0,
  })
  globalStock: number;
}

export const OfficeSchema = SchemaFactory.createForClass(Office);
/* eslint-disable */
