/* eslint-disable */
/**
 * DTO para actualizar una caja de dinero
 *
 * Contiene los datos necesarios para actualizar una caja de dinero
 *
 * @property {number} closing_balance - Monto final de la caja
 * @property {number} total_income - Monto total de ingresos
 * @property {number} total_expenses - Monto total de egresos
 */
export class UpdateCashRegisterDto {
  readonly closing_balance: number;
  readonly total_income: number;
  readonly total_expenses: number;
}
