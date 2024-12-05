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
 * @property {string} [phone] - Tel fono del cliente (opcional)
 * @property {string} [mail] - Correo electr nico del cliente (opcional)
 * @property {string[]} [transactions] - Transacciones realizadas por el cliente (opcional)
 * @property {string[]} [movements] - Movimientos de caja realizados por el cliente (opcional)
 * @property {string[]} [observations] - Observaciones del cliente (opcional)
 */
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

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
   * Tel fono del cliente (opcional)
   */
  @IsString()
  @IsOptional()
  phone?: string;

  /**
   * Correo electr nico del cliente (opcional)
   */
  @IsString()
  @IsOptional()
  mail?: string;

  /**
   * Transacciones realizadas por el cliente (opcional)
   */
  @IsArray()
  @IsOptional()
  transactions?: string[];

  /**
   * Movimientos de caja realizados por el cliente (opcional)
   */
  @IsArray()
  @IsOptional()
  movements?: string[];

  /**
   * Observaciones del cliente (opcional)
   */
  @IsArray()
  @IsOptional()
  observations?: string[];
}
