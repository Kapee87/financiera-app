/* eslint-disable */
/**
 * DTO para actualizar un gasto
 *
 * Contiene los datos necesarios para actualizar un gasto
 *
 * @property {string} [description] - Descripción del gasto (opcional)
 * @property {string} [type] - Tipo de gasto (ingreso o egreso) (opcional)
 * @property {number} [amount] - Monto del gasto (opcional)
 * @property {string} [account] - Cuenta en la que se realizó el gasto (opcional)
 */
import {
  IsMongoId,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsMongoId()
  account?: string;
}
