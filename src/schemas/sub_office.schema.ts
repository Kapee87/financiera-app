/* eslint-disable */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { User } from './user.schema';

export type SubOfficeDocument = SubOffice & Document;

@Schema()
export class SubOffice {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  address: string;

  phone: string;

  @Prop({ required: true, type: Number, default: 0 })
  cashOnhand: number; // Dinero en efectivo disponible en la sub-agencia

  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name }) // Referencia a usuarios
  users: string[]; // Lista de usuarios que tienen acceso a esta sucursal
}

export const SubOfficeSchema = SchemaFactory.createForClass(SubOffice);
