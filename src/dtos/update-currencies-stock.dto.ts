/* eslint-disable */
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CurrencyUpdateItem {
  @IsNotEmpty()
  currencyId: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  operation: 'increase' | 'decrease' | 'set';
}

export class UpdateCurrenciesStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrencyUpdateItem)
  updates: CurrencyUpdateItem[];
}
