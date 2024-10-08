/* eslint-disable */
/**
 * Esquema de usuario en la base de datos
 */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { Roles } from 'src/utils/enums/roles.enum';

@Schema({
  timestamps: true,
})
export class User {
  /**
   * Identificador único del usuario
   */
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  /**
   * Nombre de usuario
   */
  @Prop({
    required: true,
  })
  username: string;

  /**
   * Apellido del usuario
   */
  @Prop({ required: true })
  lastname: string;

  /**
   * Contraseña del usuario
   */
  @Prop({
    required: true,
  })
  password: string;

  /**
   * Correo electrónico del usuario
   */
  @Prop({ unique: true, required: true })
  email: string;

  /**
   * Estado del usuario (activo o inactivo)
   */
  @Prop({ required: true, default: true })
  isActive: boolean;

  /**
   * Rol del usuario (administrador o usuario normal)
   */
  @Prop({ type: String, enum: Roles, required: true, default: Roles.User })
  role: Roles;
}

export const UserSchema = SchemaFactory.createForClass(User);
