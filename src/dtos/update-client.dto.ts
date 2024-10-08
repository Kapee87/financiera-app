/* eslint-disable */
/**
 * DTO para actualizar un cliente
 *
 * Contiene los datos necesarios para actualizar un cliente
 *
 * @property {string} name - Nombre del cliente
 * @property {number} money - Dinero que el cliente tiene en la cuenta
 * @property {string} accountNumber - Número de cuenta del cliente
 * @property {number} phone - Teléfono del cliente
 * @property {string} mail - Correo electrónico del cliente
 */
import { Prop } from '@nestjs/mongoose';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends CreateClientDto {
  /**
   * Nombre del cliente
   */
  @Prop({ required: true })
  name: string;

  /**
   * Dinero que el cliente tiene en la cuenta
   */
  @Prop({ type: Number, default: 0 })
  money?: number;

  /**
   * Número de cuenta del cliente
   */
  @Prop({ required: true })
  accountNumber: string;

  /**
   * Teléfono del cliente
   */
  @Prop({ type: Number })
  phone?: number;

  /**
   * Correo electrónico del cliente
   */
  @Prop({ type: String, default: '' })
  mail?: string;
}
