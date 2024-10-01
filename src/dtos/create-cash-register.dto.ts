/* eslint-disable */

import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class CreateCashRegisterDto {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  opening_balance: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  sub_office: string;
}
