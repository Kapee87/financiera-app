/* eslint-disable */
/**
 * DTO para crear un cliente
 *
 * Contiene los datos necesarios para crear un nuevo cliente
 *
 * @property {string} name - Nombre del cliente
 * @property {string} email - Correo electrónico del cliente
 * @property {number} [phone] - Teléfono del cliente (opcional)
 * @property {string} address - Dirección del cliente
 */
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateClientDto {
  /**
   * Nombre del cliente
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Correo electrónico del cliente
   */
  @IsString()
  @IsNotEmpty()
  email: string;

  /**
   * Teléfono del cliente (opcional)
   */
  @IsNumber()
  phone?: number;

  /**
   * Dirección del cliente
   */
  @IsString()
  @IsNotEmpty()
  address: string;
}
