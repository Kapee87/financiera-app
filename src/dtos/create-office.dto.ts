/* eslint-disable */
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOfficeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  users?: Array<string>;
}
