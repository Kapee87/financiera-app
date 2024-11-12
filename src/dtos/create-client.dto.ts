/* eslint-disable */
/**
 * DTO para crear un cliente
 *
 * Contiene los datos necesarios para crear un nuevo cliente
 *
 * @property {string} name - Nombre del cliente
 * @property {string} lastname - Apellido del cliente
 * @property {number} [money] - Dinero que el cliente tiene en la cuenta (opcional)
 * @property {number} [totalDebts] - Total de deudas del cliente (opcional)
 * @property {number} [totalPayments] - Total de pagos del cliente (opcional)
 * @property {string} [phone] - Teléfono del cliente (opcional)
 * @property {string} [mail] - Correo electrónico del cliente (opcional)
 */
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateClientDto {
  /**
   * Nombre del cliente
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Apellido del cliente
   */
  @IsString()
  @IsNotEmpty()
  lastname: string;

  /**
   * Dinero que el cliente tiene en la cuenta (opcional)
   */
  @IsNumber()
  @IsOptional()
  money?: number;

  /**
   * Total de deudas del cliente (opcional)
   */
  @IsNumber()
  @IsOptional()
  totalDebts?: number;

  /**
   * Total de pagos del cliente (opcional)
   */
  @IsNumber()
  @IsOptional()
  totalPayments?: number;

  /**
   * Teléfono del cliente (opcional)
   */
  @IsString()
  @IsOptional()
  phone?: string;

  /**
   * Correo electrónico del cliente (opcional)
   */
  @IsString()
  @IsOptional()
  mail?: string;
}
