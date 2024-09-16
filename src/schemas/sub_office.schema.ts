/* eslint-disable */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubOfficeDocument = SubOffice & Document;

@Schema()
export class SubOffice {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: String, required: true, ref: 'Office', typeCast: 'ObjectId' })
  officeId: string;

  @Prop({ type: [String], ref: 'User', default: [] })
  userIds: string[];
}

export const SubOfficeSchema = SchemaFactory.createForClass(SubOffice);
