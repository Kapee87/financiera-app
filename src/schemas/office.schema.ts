/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { User } from './user.schema'; // Asegúrate de la ruta correcta

@Schema({
  timestamps: true,
})
export class Office {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  name: string; // Nombre de la sucursal

  @Prop({ required: true })
  address: string; // Dirección de la sucursal

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'SubOffice', required: true })
  sub_offices: string[]; // Sub oficinas que pertenecen a esta oficina
}

export const OfficeSchema = SchemaFactory.createForClass(Office);
/* eslint-disable */
