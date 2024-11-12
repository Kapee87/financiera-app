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
   * Dinero que el cliente tiene en la cuenta
   */
  @Prop({ type: Number, default: 0 })
  money?: number;

  /**
   * Total de deudas del cliente
   */
  @Prop({ type: Number, default: 0 })
  totalDebts?: number;

  /**
   * Total de pagos del cliente
   */
  @Prop({ type: Number, default: 0 })
  totalPayments?: number;

  /**
   * Teléfono del cliente
   */
  @Prop({ type: String, default: '' })
  phone?: string;

  /**
   * Correo electrónico del cliente
   */
  @Prop({ type: String, default: '' })
  mail?: string;
}
