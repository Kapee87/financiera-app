/* eslint-disable */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Roles } from 'src/utils/enums/roles.enum';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({
    required: true,
  })
  username: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ type: String, enum: Roles, required: true, default: Roles.User })
  role: Roles;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Business' })
  businessId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
