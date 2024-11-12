/* eslint-disable */
/**
 * DTO para crear un movimiento
 *
 * Contiene los datos necesarios para crear un movimiento
 *
 * @property {ObjectId} subOffice - Suboficina en la que se realizó el movimiento
 * @property {Date} date - Fecha en la que se realizó el movimiento
 * @property {Number} amount - Monto del movimiento
 * @property {String} description - Descripción del movimiento
 * @property {String} category - Tipo de movimiento (ingreso o egreso)
 * @property {String} type - Tipo de movimiento (tipo de movimiento mas detallado)
 * @property {ObjectId} user - usuario que realizó el movimiento
 */
import { IsMongoId, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class CreateMovementDto {
  @IsMongoId()
  @IsNotEmpty()
  subOffice: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  description: string;

  @IsEnum(['ingreso', 'egreso'])
  @IsNotEmpty()
  category: 'ingreso' | 'egreso';

  @IsNotEmpty()
  type: string;

  @IsMongoId()
  @IsNotEmpty()
  user: string;
}
