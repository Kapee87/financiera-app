/* eslint-disable */

import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class updateSubOfficeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  cashOnhand?: number;

  @IsString()
  @IsOptional()
  users?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  currencies?: {
    currency: Types.ObjectId;
    stock: number;
  }[];
}
