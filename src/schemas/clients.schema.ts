/* eslint-disable */
/**
 * Esquema de Clientes
 *
 * Contiene la información de cada cliente de la empresa
 *
 * @property {string} name - Nombre del cliente
 * @property {number} money - Dinero que el cliente tiene en la cuenta
 * @property {string} accountNumber - Número de cuenta del cliente
 * @property {string} phone - Teléfono del cliente
 * @property {string} mail - Correo electrónico del cliente
 * @property {ObjectId[]} transactions - Transacciones realizadas por el cliente
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaType, SchemaTypes } from 'mongoose';

export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  money?: number;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ type: String, default: '' })
  phone?: string;

  @Prop({ type: String, default: '' })
  mail?: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Transaction', default: [] })
  transactions?: string[];
}

export const ClientSchema = SchemaFactory.createForClass(Client);
