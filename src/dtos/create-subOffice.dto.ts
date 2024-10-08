/* eslint-disable */
/**
 * DTO para crear una suboficina
 *
 * Contiene los datos necesarios para crear una suboficina
 *
 * @property {string} name - Nombre de la suboficina
 * @property {string} address - Dirección de la suboficina
 * @property {string} phone - Teléfono de la suboficina
 * @property {string} code - Código de la suboficina
 * @property {number} [cashOnhand] - Monto de dinero en efectivo que se encuentra en la suboficina al momento de su creación (opcional, por defecto es 0)
 * @property {string[]} [users] - Arreglo de identificadores de los usuarios que tendrán acceso a la suboficina (opcional)
 * @property {{ currency: string, stock: number }[]} [currencies] - Arreglo de objetos que contienen la información de las monedas que se manejan en la suboficina (opcional)
 */
import {
  IsString,
  IsNotEmpty,
  IsArray,
  isNumber,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class createSubOfficeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsOptional()
  cashOnhand?: number = 0;

  @IsString()
  users?: string[];

  @IsArray()
  currencies?: {
    currency: string;
    stock: number;
  }[];
}
