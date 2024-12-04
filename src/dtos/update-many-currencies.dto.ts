/* eslint-disable */
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateManyCurrenciesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateManyCurrenciesItem)
  updates: UpdateManyCurrenciesItem[];
}

export class UpdateManyCurrenciesItem {
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message:
      'currencyId debe ser un ID de MongoDB válido (cadena hexadecimal de 24 caracteres)',
  })
  currencyId: string;

  @IsOptional()
  exchangeRate?: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  isprimarycurrency?: boolean;
}
