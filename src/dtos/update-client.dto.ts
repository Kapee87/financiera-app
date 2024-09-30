/* eslint-disable */

import { Prop } from '@nestjs/mongoose';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends CreateClientDto {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  money?: number;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ type: Number })
  phone?: number;

  @Prop({ type: String, default: '' })
  mail?: string;
}
