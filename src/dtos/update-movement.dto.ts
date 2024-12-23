/* eslint-disable */
/**
 * DTO para actualizar un movimiento
 *
 * Contiene los datos necesarios para actualizar un movimiento
 *
 * @property {string} [description] - Descripción del movimiento (opcional)
 * @property {string} [type] - Tipo de movimiento (ingreso o egreso) (opcional)
 * @property {number} [amount] - Monto del movimiento (opcional)
 * @property {string} [account] - Cuenta en la que se realizó el movimiento (opcional)
 */
import {
  IsMongoId,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateMovementDto {
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(['ingreso', 'egreso'])
  type?: 'ingreso' | 'egreso';

  @IsOptional()
  @IsNumber()
  amount?: number;
}
