/* eslint-disable */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class superKeyDto {
  @IsNotEmpty()
  @IsString()
  superkey: string;
}
