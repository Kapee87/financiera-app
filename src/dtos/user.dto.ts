/* eslint-disable */
/**
 * DTO para el usuario
 *
 * Contiene los datos necesarios para crear o actualizar un usuario
 *
 * @property {string} username - Nombre de usuario
 * @property {string} email - Correo electrónico del usuario
 * @property {string} password - Contraseña del usuario
 * @property {string} lastname - Apellido del usuario
 * @property {boolean} isActive - Estado del usuario (activo o inactivo)
 * @property {Roles} role - Rol del usuario
 */
import {
  IsBoolean,
  isBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Roles } from 'src/utils/enums/roles.enum';

export class userDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsNotEmpty()
  role: Roles;
}
