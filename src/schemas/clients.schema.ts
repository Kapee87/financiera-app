/* eslint-disable */
/**
 * Esquema de Clientes
 *
 * Contiene la información de cada cliente de la empresa
 *
 * @property {string} name - Nombre del cliente
 * @property {string} lastname - Apellido del cliente
 * @property {number} money - Dinero que el cliente tiene en la cuenta
 * @property {number} totalDebts - Total de deudas del cliente
 * @property {number} totalPayments - Total de pagos del cliente
 * @property {string} phone - Teléfono del cliente
 * @property {string} mail - Correo electrónico del cliente
 * @property {ObjectId[]} transactions - Transacciones realizadas por el cliente
 * @property {ObjectId[]} movements - Movimientos de caja realizados por el cliente
 * @property {string[]} observations - Observaciones del cliente
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaType, SchemaTypes } from 'mongoose';

export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ type: Number, default: 0 })
  money?: number;

  @Prop({ type: Number, default: 0 })
  totalDebts?: number;

  @Prop({ type: Number, default: 0 })
  totalPayments?: number;

  @Prop({ type: String, default: '' })
  phone?: string;

  @Prop({ type: String, default: '' })
  mail?: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Transaction', default: [] })
  transactions?: string[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Movement', default: [] })
  movements?: string[];

  @Prop({ type: [String], default: [] })
  observations?: string[];
}

export const ClientSchema = SchemaFactory.createForClass(Client);
