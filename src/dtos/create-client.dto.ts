/* eslint-disable */
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  phone?: number;

  @IsString()
  @IsNotEmpty()
  address: string;
}
