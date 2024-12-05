/* eslint-disable */

import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MovementFilterDto {
  @IsOptional()
  @IsEnum(['ingreso', 'egreso'])
  category?: 'ingreso' | 'egreso';

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  subOffice?: string;

  @IsOptional()
  @IsString()
  user?: string;
}
