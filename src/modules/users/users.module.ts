/* eslint-disable */
/**
 * Módulo de usuarios
 *
 * Contiene la lógica para manejar a los usuarios
 *
 * @author
 * @version 1.0.0
 * @since 2020-07-20
 */
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
/**
 * Schema de usuarios
 *
 * Contiene la definición de la estructura de la colección de usuarios
 */
import { User, UserSchema } from 'src/schemas/user.schema';
/**
 * Controlador de usuarios
 *
 * Contiene métodos para manejar las solicitudes relacionadas con los usuarios
 */
import { UsersController } from './user.controller';

/**
 * Servicio de usuarios
 *
 * Contiene métodos para realizar operaciones relacionadas con los usuarios
 */
import { UsersService } from './users.service';
/**
 * Módulo de autenticación con Passport
 *
 * Permite la autenticación de los usuarios con contraseña y correo electrónico
 */
import { PassportModule } from '@nestjs/passport';
/**
 * Módulo de autenticación con JWT
 *
 * Permite la autenticación de los usuarios con tokens JWT
 */
import { JwtModule } from '@nestjs/jwt';
import { SubOfficeModule } from '../sub_office/sub_office.module';

@Module({
  /**
   * Importaciones del módulo
   *
   * Se importan los módulos necesarios para el funcionamiento del módulo de usuarios
   */
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule,
    forwardRef(() => SubOfficeModule),
  ],
  /**
   * Controladores del módulo
   *
   * Se definen los controladores que se encargan de manejar las solicitudes
   */
  controllers: [UsersController],
  /**
   * Proveedores del módulo
   *
   * Se definen los proveedores que se encargan de realizar operaciones
   */
  providers: [UsersService],
  /**
   * Exportaciones del módulo
   *
   * Se exportan los módulos y proveedores necesarios para que puedan ser utilizados
   * en otros módulos
   */
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
