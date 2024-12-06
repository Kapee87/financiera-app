/* eslint-disable */
/**
 * DTO para cerrar una caja de dinero
 *
 * Contiene los datos necesarios para cerrar una caja de dinero
 *
 * @property {Currency} currencyId - Tasa de cambio entre USD y ARS
 * @property {USer} userId - Monto final de la caja de dinero
 */

import { IsOptional, IsString } from 'class-validator';

export class cashRegisterFilterDto {
  @IsOptional()
  @IsString()
  currencyId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
