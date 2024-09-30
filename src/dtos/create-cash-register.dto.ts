/* eslint-disable */

import { Prop } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export class CreateCashRegisterDto {
  @Prop({ type: Date, required: true })
  readonly date: Date;

  @Prop({ type: Number, required: true })
  readonly opening_balance: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'SubOffice', required: true })
  readonly sub_office: string;
}
