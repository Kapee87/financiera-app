/* eslint-disable */
/**
 * DTO para el endpoint de creación de super administrador
 *
 * Contiene el campo de la clave de super administrador
 *
 * @property {string} superkey - Clave de super administrador
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class superKeyDto {
  @IsNotEmpty()
  @IsString()
  superkey: string;
}
