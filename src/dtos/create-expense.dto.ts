/* eslint-disable */
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
