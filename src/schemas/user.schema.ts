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
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: String, enum: Roles, required: true, default: Roles.User })
  role: Roles;
}

export const UserSchema = SchemaFactory.createForClass(User);
/* eslint-disable */
