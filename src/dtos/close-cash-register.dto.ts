/* eslint-disable */
/**
 * DTO para cerrar una caja de dinero
 *
 * Contiene los datos necesarios para cerrar una caja de dinero
 *
 * @property {Number} usd_ars_rate - Tasa de cambio entre USD y ARS
 * @property {Number} closing_balance - Monto final de la caja de dinero
 */
import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CloseCashRegisterDto {
  /**
   * Tasa de cambio de USD
   */
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  usd_rate: number;

  /**
   * Tasa de cambio de ARS
   */
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  ars_rate: number;

  /**
   * Monto final de la caja de dinero
   */
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  closing_balance?: number;
}
