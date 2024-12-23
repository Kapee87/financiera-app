/* eslint-disable */
/**
 * DTO para el update de usuario
 *
 * Contiene los datos necesarios para actualizar un usuario
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
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Roles } from 'src/utils/enums/roles.enum';

export class updateUserDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  role: Roles;

  @IsOptional()
  @IsString()
  phone: string;
}
