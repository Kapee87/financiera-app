/* eslint-disable */
/**
 * DTO para actualizar una suboficina
 *
 * Contiene los datos necesarios para actualizar una suboficina existente
 *
 * @property {string} [name] - Nombre de la suboficina (opcional)
 * @property {string} [address] - Dirección de la suboficina (opcional)
 * @property {string} [phone] - Teléfono de la suboficina (opcional)
 * @property {string} [code] - Código de la suboficina (opcional)
 * @property {number} [cashOnhand] - Monto de dinero en efectivo que se encuentra en la suboficina al momento de su actualización (opcional)
 * @property {ObjectId[]} [users] - Arreglo de identificadores de los usuarios que tendrán acceso a la suboficina (opcional)
 * @property {{ currency: ObjectId, stock: number }[]} [currencies] - Arreglo de objetos que contienen la información de las monedas que se manejan en la suboficina (opcional)
 */
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class updateSubOfficeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  cashOnhand?: number;

  @IsString()
  @IsOptional()
  users?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  currencies?: {
    currency: Types.ObjectId;
    stock: number;
  }[];
}
