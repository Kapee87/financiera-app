/* eslint-disable */
/**
 * DTO para actualizar un cliente
 *
 * Contiene los datos necesarios para actualizar un cliente
 *
 * @property {string} name - Nombre del cliente
 * @property {string} lastname - Apellido del cliente
 * @property {number} money - Dinero que el cliente tiene en la cuenta
 * @property {number} totalDebts - Total de deudas del cliente
 * @property {number} totalPayments - Total de pagos del cliente
 * @property {string} phone - Teléfono del cliente
 * @property {string} mail - Correo electrónico del cliente
 */
import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class UpdateClientDto {
  /**
   * Nombre del cliente
   */
  @Prop({ required: true })
  name: string;

  /**
   * Apellido del cliente
   */
  @Prop({ required: true })
  lastname: string;

  /**
   * Nueva contraseña del cliente
   */
  @Prop()
  password: string;

  /**
   * Dinero que el cliente tiene en la cuenta
   */
  @Prop({ type: Number, default: 0 })
  money: number;

  /**
   * Dinero a sumar en la cuenta del cliente
   */
  @Prop({ type: Number, default: 0 })
  addMoney: number;

  /**
   * Dinero a restar en la cuenta del cliente
   */
  @Prop({ type: Number, default: 0 })
  subtractMoney: number;

  /**
   * Total de deudas del cliente
   */
  @Prop({ type: Number, default: 0 })
  totalDebts: number;

  /**
   * Total de pagos del cliente
   */
  @Prop({ type: Number, default: 0 })
  totalPayments: number;

  /**
   * Teléfono del cliente
   */
  @Prop({ type: String, default: '' })
  phone: string;

  /**
   * Correo electrónico del cliente
   */
  @Prop({ type: String, default: '' })
  mail: string;

  /**
   * Transacciones realizadas por el cliente
   */
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Transaction', default: [] })
  transactions: string[];

  /**
   * Movimientos de caja realizados por el cliente
   */
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Movement', default: [] })
  movements: string[];

  /**
   * Observaciones del cliente
   */
  @Prop({ type: [String], default: [] })
  observations: string[];
}
