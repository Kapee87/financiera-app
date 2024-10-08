/* eslint-disable */
/**
 * DTO para crear un gasto
 *
 * Contiene los datos necesarios para crear un gasto
 *
 * @property {ObjectId} subOffice - Suboficina en la que se realizó el gasto
 * @property {Date} date - Fecha en la que se realizó el gasto
 * @property {Number} amount - Monto del gasto
 * @property {String} description - Descripción del gasto
 * @property {String} type - Tipo de gasto (ingreso o egreso)
 * @property {ObjectId} account - Cuenta en la que se realizó el gasto
 */
import { IsMongoId, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class CreateExpenseDto {
  @IsMongoId()
  @IsNotEmpty()
  subOffice: string;

  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  type: string;

  @IsMongoId()
  @IsNotEmpty()
  account: string;
}
