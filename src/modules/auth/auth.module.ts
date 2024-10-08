/* eslint-disable */
/**
 * Este módulo se encarga de la autenticación por medio de tokens (jwt)
 * y passport para la autenticación por medio de credenciales
 *
 * @since 1.0.0
 * @version 1.0.0
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
/**
 * Esta clase es un strategy para la autenticación por medio de tokens (jwt)
 */
import { JwtStrategy } from '../../utils/jwt.strategy';
import { AuthController } from './auth.controller';
/**
 * Este módulo se encarga de la gestión de usuarios
 */
import { UsersModule } from '../users/users.module';
/**
 * Este servicio se encarga de la gestión de usuarios
 */
import { UsersService } from '../users/users.service';
/**
 * Este módulo se encarga de la gestión de peticiones HTTP
 */
import { HttpModule } from '@nestjs/axios';
/**
 * Este módulo se encarga de la gestión de correos electrónicos
 */
import { MailerModule } from 'src/utils/mailer/mailer.module';
/**
 * Este servicio se encarga de la gestión de plantillas de correos electrónicos
 */
import { TemplatesService } from 'src/utils/template.service';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      /**
       * Esta función se encarga de configurar el módulo de jwt
       * con la clave secreta del token y el tiempo de vida del mismo
       */
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      /**
       * Se inyecta el servicio de configuración para que se pueda utilizar
       * en la función de configuración del módulo de jwt
       */
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, TemplatesService],
  /**
   * Se exporta el servicio de autenticación para que pueda ser utilizado
   * en otros módulos
   */
  exports: [AuthService],
})
export class AuthModule {}
