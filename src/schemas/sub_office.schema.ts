/* eslint-disable */
/**
 * Esquema de la colección de SubOficinas
 *
 * @name SubOffice
 * @collection sub_offices
 * @property {string} name - Nombre de la suboficina
 * @property {string} code - Código único de la suboficina
 * @property {string} address - Dirección de la suboficina
 * @property {string} phone - Teléfono de la suboficina
 * @property {ObjectId[]} users - Lista de usuarios que tienen acceso a esta sucursal
 * @property {{currency: ObjectId, stock: number}[]} currencies - Lista de monedas y su stock disponible
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type SubOfficeDocument = SubOffice & Document;

@Schema()
export class SubOffice {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ unique: true })
  numeroIdentificacion: number;

  @Prop({ required: true })
  address: string;

  phone: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) // Referencia a usuarios
  users: Types.ObjectId[]; // Lista de usuarios que tienen acceso a esta sucursal

  @Prop({
    type: [
      {
        currency: { type: Types.ObjectId, ref: 'Currency', autopopulate: true },
        stock: { type: Number, required: true },
      },
    ],
  })
  currencies: { currency: Types.ObjectId; stock: number; _id?: string }[];
}

export const SubOfficeSchema = SchemaFactory.createForClass(SubOffice);
