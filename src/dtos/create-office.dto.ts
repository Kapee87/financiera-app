/* eslint-disable */
/**
 * DTO para crear una oficina
 *
 * Contiene los datos necesarios para crear una nueva oficina
 *
 * @property {string} name - Nombre de la oficina
 * @property {string} address - Dirección de la oficina
 * @property {string[]} users - Arreglo de identificadores de los usuarios que tendrán acceso a la oficina (opcional)
 */
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOfficeDto {
  /**
   * Nombre de la oficina
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Dirección de la oficina
   */
  @IsString()
  @IsNotEmpty()
  address: string;

  /**
   * Arreglo de identificadores de los usuarios que tendrán acceso a la oficina
   */
  @IsString()
  users?: Array<string>;
}
