/* eslint-disable */
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
