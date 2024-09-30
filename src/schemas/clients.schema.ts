/* eslint-disable */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  money?: number;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ type: String, default: '' })
  phone?: string;

  @Prop({ type: String, default: '' })
  mail?: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
