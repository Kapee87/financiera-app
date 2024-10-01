/* eslint-disable */
/* eslint-disable */
import {
  IsString,
  IsNotEmpty,
  IsArray,
  isNumber,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class createSubOfficeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsOptional()
  cashOnhand?: number = 0;

  @IsString()
  users?: string[];

  @IsArray()
  currencies?: {
    currency: string;
    stock: number;
  }[];
}
